"use client";

import { useState } from "react";
import {
  HOUR_HEIGHT,
  DAY_START_HOUR,
  TOTAL_HOURS,
  GRID_HEIGHT,
  positionToMinutes,
} from "./calendar-constants";
import { CalendarTimeBlock } from "./calendar-time-block";
import { CalendarEventBlock, layoutEvents } from "./calendar-event-block";
import type { CalendarEventData } from "./calendar-event-block";
import { CalendarScheduleOverlay } from "./calendar-schedule-overlay";
import type { Schedule } from "./calendar-schedule-overlay";
import { CalendarCreateDialog } from "./calendar-create-dialog";
import type { TimeBlockData } from "./calendar-time-block";

interface Props {
  date: Date;
  timeBlocks: TimeBlockData[];
  calendarEvents: CalendarEventData[];
  schedules: Schedule[];
  isToday: boolean;
  onDeleteBlock?: (id: string) => void;
}

export function CalendarDayColumn({
  date,
  timeBlocks,
  calendarEvents,
  schedules,
  isToday,
  onDeleteBlock,
}: Props) {
  const [createDialog, setCreateDialog] = useState<{ open: boolean; startMinutes: number }>({
    open: false,
    startMinutes: 9 * 60,
  });

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = positionToMinutes(y);
    setCreateDialog({ open: true, startMinutes: minutes });
  }

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const showCurrentTime = isToday && currentMinutes >= DAY_START_HOUR * 60 && currentMinutes <= (DAY_START_HOUR + TOTAL_HOURS) * 60;
  const currentTimeTop = ((currentMinutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;

  return (
    <>
      <div
        className="relative border-l border-border cursor-pointer overflow-hidden"
        style={{ height: GRID_HEIGHT }}
        onClick={handleColumnClick}
      >
        {/* Hour grid lines */}
        {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-border/30"
            style={{ top: i * HOUR_HEIGHT }}
          />
        ))}

        {/* Schedule overlays */}
        <CalendarScheduleOverlay
          schedules={schedules}
          dayOfWeek={date.getDay()}
        />

        {/* Calendar events (with overlap layout) */}
        {layoutEvents(calendarEvents as CalendarEventData[], date).map(({ event, column, totalColumns }) => (
          <CalendarEventBlock
            key={event.id}
            event={event}
            dayDate={date}
            column={column}
            totalColumns={totalColumns}
          />
        ))}

        {/* Time blocks */}
        {timeBlocks.map((block) => (
          <CalendarTimeBlock
            key={block.id}
            block={block}
            onDelete={onDeleteBlock}
          />
        ))}

        {/* Current time indicator */}
        {showCurrentTime && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: currentTimeTop }}
          >
            <div className="h-0.5 bg-red-500 relative">
              <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
          </div>
        )}
      </div>

      <CalendarCreateDialog
        open={createDialog.open}
        onOpenChange={(open) => setCreateDialog((p) => ({ ...p, open }))}
        date={date}
        startMinutes={createDialog.startMinutes}
      />
    </>
  );
}
