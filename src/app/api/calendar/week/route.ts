import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");

  if (!startParam) {
    return NextResponse.json({ error: "start parameter required (YYYY-MM-DD)" }, { status: 400 });
  }

  // Parse as local midnight (not UTC) to match how dates are stored
  const [y, m, d] = startParam.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 7);

  const [timeBlocks, calendarEvents, schedules, calendarFeeds] = await Promise.all([
    prisma.timeBlock.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        task: {
          select: {
            id: true, title: true, priority: true, status: true,
            workspaceId: true, assignee: true,
            workspace: { select: { color: true } },
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.calendarEvent.findMany({
      where: {
        startTime: { lt: end },
        endTime: { gt: start },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.schedule.findMany({
      include: { windows: true },
    }),
    prisma.calendarFeed.findMany({
      select: { url: true, color: true, name: true },
    }),
  ]);

  // Build a color map from feed URL to color
  const feedColorMap: Record<string, string> = {};
  const feedNameMap: Record<string, string> = {};
  for (const feed of calendarFeeds) {
    if (feed.color) feedColorMap[feed.url] = feed.color;
    feedNameMap[feed.url] = feed.name;
  }

  // Attach feed color and name to each calendar event
  const enrichedEvents = calendarEvents.map((evt) => ({
    ...evt,
    feedColor: evt.calendarUrl ? feedColorMap[evt.calendarUrl] || null : null,
    feedName: evt.calendarUrl ? feedNameMap[evt.calendarUrl] || null : null,
  }));

  return NextResponse.json({ timeBlocks, calendarEvents: enrichedEvents, schedules });
}
