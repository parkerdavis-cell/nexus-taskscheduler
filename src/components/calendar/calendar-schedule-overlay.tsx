"use client";

import { minutesToTop, minutesToHeight, timeToMinutes } from "./calendar-constants";

export interface ScheduleWindow {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  scheduleId: string;
}

export interface Schedule {
  id: string;
  name: string;
  color: string;
  windows: ScheduleWindow[];
}

interface Props {
  schedules: Schedule[];
  dayOfWeek: number;
}

export function CalendarScheduleOverlay({ schedules, dayOfWeek }: Props) {
  return (
    <>
      {schedules.map((schedule) =>
        schedule.windows
          .filter((w) => w.dayOfWeek === dayOfWeek)
          .map((w) => {
            const start = timeToMinutes(w.startTime);
            const end = timeToMinutes(w.endTime);
            return (
              <div
                key={w.id}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: minutesToTop(start),
                  height: minutesToHeight(end - start),
                  backgroundColor: schedule.color + "08",
                  borderLeft: `2px solid ${schedule.color}20`,
                }}
              >
                <span
                  className="text-[9px] px-1 opacity-40 select-none"
                  style={{ color: schedule.color }}
                >
                  {schedule.name}
                </span>
              </div>
            );
          })
      )}
    </>
  );
}
