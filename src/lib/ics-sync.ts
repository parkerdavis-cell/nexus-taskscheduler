import { prisma } from "@/lib/db";

const SYNC_WINDOW_WEEKS = 6;
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Convert common calendar share URLs to their ICS feed equivalents.
 * - Google Calendar `?cid=` URLs → public ICS feed URL
 */
function resolveIcsUrl(url: string): string {
  try {
    const u = new URL(url);

    // Google Calendar cid= URL → ICS feed
    if (u.hostname === "calendar.google.com" && u.searchParams.has("cid")) {
      const cid = u.searchParams.get("cid")!;
      // cid is base64-encoded email
      const email = Buffer.from(cid, "base64").toString("utf-8");
      return `https://calendar.google.com/calendar/ical/${encodeURIComponent(email)}/public/basic.ics`;
    }

    return url;
  } catch {
    return url;
  }
}

interface ParsedEvent {
  externalId: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  busyStatus: string;
}

function str(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "val" in v) return String((v as { val: unknown }).val);
  return String(v);
}

async function parseIcsText(icsText: string, windowStart: Date, windowEnd: Date): Promise<ParsedEvent[]> {
  // Dynamic import to avoid Turbopack BigInt bundling issue
  const ical = await import("node-ical");
  const parsed = ical.parseICS(icsText);
  const events: ParsedEvent[] = [];

  for (const key of Object.keys(parsed)) {
    const comp = parsed[key];
    if (!comp || comp.type !== "VEVENT") continue;
    const vevent = comp as import("node-ical").VEvent;

    // Determine busy status
    const transp = (vevent as Record<string, unknown>).transparency;
    const busyStatus = typeof transp === "string" && transp.toUpperCase() === "TRANSPARENT" ? "FREE" : "BUSY";

    const baseTitle = str(vevent.summary) || "Untitled";
    const description = str(vevent.description);
    const location = str(vevent.location);

    // Handle recurring events
    if (vevent.rrule) {
      const instances = vevent.rrule.between(windowStart, windowEnd, true);
      for (const instanceStart of instances) {
        const duration = vevent.end
          ? vevent.end.getTime() - vevent.start.getTime()
          : 3600000;
        const instanceEnd = new Date(instanceStart.getTime() + duration);
        const externalId = `${vevent.uid}_${instanceStart.toISOString()}`;

        events.push({
          externalId,
          title: baseTitle,
          description,
          location,
          startTime: instanceStart,
          endTime: instanceEnd,
          isAllDay: vevent.datetype === "date",
          busyStatus,
        });
      }
    } else {
      const start = vevent.start;
      const end = vevent.end || new Date(start.getTime() + 3600000);

      if (end >= windowStart && start <= windowEnd) {
        events.push({
          externalId: `${vevent.uid}_${start.toISOString()}`,
          title: baseTitle,
          description,
          location,
          startTime: start,
          endTime: end,
          isAllDay: vevent.datetype === "date",
          busyStatus,
        });
      }
    }
  }

  // Deduplicate by externalId (keep last occurrence)
  const seenById = new Map<string, ParsedEvent>();
  for (const e of events) seenById.set(e.externalId, e);

  // Also deduplicate by (startTime, title) — recurring event modifications
  // can produce two entries for the same slot
  const seenBySlot = new Map<string, ParsedEvent>();
  for (const e of seenById.values()) {
    const key = `${e.startTime.toISOString()}|${e.title}`;
    const existing = seenBySlot.get(key);
    if (!existing || existing.externalId.length > e.externalId.length) {
      seenBySlot.set(key, e);
    }
  }
  return Array.from(seenBySlot.values());
}

export async function syncCalendarFeed(feedId: string) {
  const feed = await prisma.calendarFeed.findUnique({ where: { id: feedId } });
  if (!feed) throw new Error(`Feed ${feedId} not found`);

  try {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - 7);
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + SYNC_WINDOW_WEEKS * 7);

    const icsUrl = resolveIcsUrl(feed.url);

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let icsText: string;
    try {
      const res = await fetch(icsUrl, { signal: controller.signal });
      if (!res.ok) {
        if (res.status === 404 && icsUrl !== feed.url) {
          throw new Error("Calendar is not public. In Google Calendar, go to Settings > your calendar > \"Secret address in iCal format\" and use that URL instead.");
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      if (!text.includes("BEGIN:VCALENDAR")) {
        throw new Error("Response is not a valid ICS feed. For Google Calendar, use the \"Secret address in iCal format\" from calendar settings.");
      }
      icsText = text;
    } finally {
      clearTimeout(timeout);
    }

    const events = await parseIcsText(icsText, windowStart, windowEnd);

    // Delete old events from this feed (match both original and resolved URLs), then insert fresh
    await prisma.calendarEvent.deleteMany({
      where: { calendarUrl: { in: [feed.url, icsUrl] } },
    });

    if (events.length > 0) {
      await prisma.calendarEvent.createMany({
        data: events.map((e) => ({
          ...e,
          calendarUrl: feed.url,
        })),
      });
    }

    // Update feed status
    await prisma.calendarFeed.update({
      where: { id: feedId },
      data: { lastSynced: new Date(), syncError: null },
    });

    return { synced: events.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.calendarFeed.update({
      where: { id: feedId },
      data: { syncError: message },
    });
    throw err;
  }
}

export async function syncAllCalendarFeeds() {
  const feeds = await prisma.calendarFeed.findMany({ where: { isActive: true } });
  const results: { feedId: string; name: string; synced?: number; error?: string }[] = [];

  for (const feed of feeds) {
    try {
      const result = await syncCalendarFeed(feed.id);
      results.push({ feedId: feed.id, name: feed.name, synced: result.synced });
    } catch (err) {
      results.push({
        feedId: feed.id,
        name: feed.name,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}
