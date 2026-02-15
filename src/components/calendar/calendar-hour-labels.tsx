"use client";

import { HOUR_HEIGHT, DAY_START_HOUR, DAY_END_HOUR } from "./calendar-constants";

export function CalendarHourLabels() {
  const hours = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
    hours.push(h);
  }

  return (
    <div className="relative" style={{ width: 60 }}>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute right-2 text-xs text-muted-foreground -translate-y-1/2"
          style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT }}
        >
          {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
        </div>
      ))}
    </div>
  );
}
