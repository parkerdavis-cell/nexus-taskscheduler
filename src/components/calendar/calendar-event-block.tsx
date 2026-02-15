"use client";

import { minutesToTop, minutesToHeight, localDateStr } from "./calendar-constants";
import { MapPin } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CalendarEventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  busyStatus: string;
  calendarUrl?: string | null;
  feedColor?: string | null;
  feedName?: string | null;
}

export interface CalendarEventLayout {
  event: CalendarEventData;
  column: number;
  totalColumns: number;
}

interface EventWithMins {
  idx: number;
  evt: CalendarEventData;
  startMins: number;
  endMins: number;
}

/**
 * Cluster-based overlap layout — like Google Calendar.
 * Events are grouped into clusters of mutually overlapping events.
 * Each cluster gets its own column count so non-overlapping time ranges
 * use the full width.
 */
export function layoutEvents(events: CalendarEventData[], dayDate: Date): CalendarEventLayout[] {
  if (events.length === 0) return [];

  const dayStr = localDateStr(dayDate);

  const items: EventWithMins[] = events.map((evt, idx) => {
    const s = new Date(evt.startTime);
    const e = new Date(evt.endTime);
    const sStr = localDateStr(s);
    const eStr = localDateStr(e);
    return {
      idx,
      evt,
      startMins: sStr === dayStr ? s.getHours() * 60 + s.getMinutes() : 6 * 60,
      endMins: eStr === dayStr ? e.getHours() * 60 + e.getMinutes() : 22 * 60,
    };
  }).sort((a, b) => a.startMins - b.startMins || a.endMins - b.endMins);

  // Group into clusters: a cluster ends when no event overlaps the next
  const results: CalendarEventLayout[] = new Array(events.length);
  let clusterStart = 0;

  while (clusterStart < items.length) {
    // Find all events in this cluster
    let clusterEnd = clusterStart;
    let maxEnd = items[clusterStart].endMins;

    while (clusterEnd + 1 < items.length && items[clusterEnd + 1].startMins < maxEnd) {
      clusterEnd++;
      maxEnd = Math.max(maxEnd, items[clusterEnd].endMins);
    }

    // Assign columns within this cluster only
    const cluster = items.slice(clusterStart, clusterEnd + 1);
    const columnEnds: number[] = [];

    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < columnEnds.length; c++) {
        if (columnEnds[c] <= item.startMins) {
          item.idx; // keep reference
          results[item.idx] = { event: item.evt, column: c, totalColumns: 0 };
          columnEnds[c] = item.endMins;
          placed = true;
          break;
        }
      }
      if (!placed) {
        results[item.idx] = { event: item.evt, column: columnEnds.length, totalColumns: 0 };
        columnEnds.push(item.endMins);
      }
    }

    // Set totalColumns for this cluster
    const totalCols = columnEnds.length;
    for (const item of cluster) {
      results[item.idx].totalColumns = totalCols;
    }

    clusterStart = clusterEnd + 1;
  }

  return results;
}

interface Props {
  event: CalendarEventData;
  dayDate: Date;
  column?: number;
  totalColumns?: number;
}

export function CalendarEventBlock({ event, dayDate, column = 0, totalColumns = 1 }: Props) {
  const evtStart = new Date(event.startTime);
  const evtEnd = new Date(event.endTime);
  const dayStr = localDateStr(dayDate);
  const evtStartStr = localDateStr(evtStart);
  const evtEndStr = localDateStr(evtEnd);

  const startMins = evtStartStr === dayStr
    ? evtStart.getHours() * 60 + evtStart.getMinutes()
    : 6 * 60;
  const endMins = evtEndStr === dayStr
    ? evtEnd.getHours() * 60 + evtEnd.getMinutes()
    : 22 * 60;

  const top = minutesToTop(startMins);
  const height = minutesToHeight(endMins - startMins);
  const isFree = event.busyStatus === "FREE";

  const startDisplay = `${evtStart.getHours() % 12 || 12}:${evtStart.getMinutes().toString().padStart(2, "0")} ${evtStart.getHours() >= 12 ? "PM" : "AM"}`;
  const endDisplay = `${evtEnd.getHours() % 12 || 12}:${evtEnd.getMinutes().toString().padStart(2, "0")} ${evtEnd.getHours() >= 12 ? "PM" : "AM"}`;

  // Feed color (from calendar feed) or fallback
  const color = event.feedColor || "#6b7280";

  // Side-by-side layout within the column
  const colWidth = 100 / totalColumns;
  const leftPct = column * colWidth;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="absolute rounded-sm px-1 py-0.5 cursor-pointer overflow-hidden border hover:brightness-125 hover:z-30"
          onClick={(e) => e.stopPropagation()}
          style={{
            top,
            height: Math.max(height, 18),
            left: `${leftPct}%`,
            width: `calc(${colWidth}% - 1px)`,
            backgroundColor: isFree ? color + "10" : color + "20",
            borderColor: isFree ? color + "30" : color + "40",
            borderLeft: `3px solid ${isFree ? color + "40" : color + "90"}`,
            opacity: isFree ? 0.6 : 1,
            zIndex: 5 + column,
          }}
        >
          <div
            className="text-[11px] font-medium leading-tight truncate"
            style={{ color: isFree ? color + "90" : color }}
          >
            {event.title}
          </div>
          {height > 28 && (
            <div className="text-[10px] truncate" style={{ color: color + "80" }}>
              {startDisplay}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="right" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <div className="font-medium">{event.title}</div>
          </div>
          <div className="text-sm text-muted-foreground">{startDisplay} - {endDisplay}</div>
          {event.feedName && (
            <div className="text-xs text-muted-foreground">{event.feedName}</div>
          )}
          {event.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" /> {event.location}
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
          )}
          <div className="text-xs text-muted-foreground capitalize">{event.busyStatus.toLowerCase()}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
