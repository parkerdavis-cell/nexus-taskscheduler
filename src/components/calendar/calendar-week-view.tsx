"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { useWeekCalendar, useAutoSchedule } from "@/hooks/use-calendar";
import { useDeleteTimeBlock } from "@/hooks/use-time-blocks";
import { CalendarHourLabels } from "./calendar-hour-labels";
import { CalendarDayColumn } from "./calendar-day-column";
import { GRID_HEIGHT, HOUR_HEIGHT, DAY_START_HOUR, localDateStr } from "./calendar-constants";
import { toast } from "sonner";
import type { WeekCalendarData } from "@/hooks/use-calendar";

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(d: Date): string {
  return localDateStr(d);
}

export function CalendarWeekView() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useWeekCalendar(weekStart);
  const autoSchedule = useAutoSchedule();
  const deleteBlock = useDeleteTimeBlock();

  // Scroll to ~8 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      const target = (8 - DAY_START_HOUR) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = target;
    }
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleAutoSchedule() {
    // Always schedule from today forward (never in the past), but cover the full week view
    const scheduleStart = weekStart > today ? weekStart : today;
    const endDate = addDays(weekStart, 7);
    autoSchedule.mutate(
      { startDate: formatDate(scheduleStart), endDate: formatDate(endDate) },
      {
        onSuccess: (result) => {
          toast.success(
            `Scheduled ${result.placed.length} block(s)` +
            (result.unplaceable.length > 0
              ? `. ${result.unplaceable.length} task(s) couldn't be placed.`
              : "")
          );
        },
        onError: () => toast.error("Auto-schedule failed"),
      }
    );
  }

  function handleDeleteBlock(id: string) {
    deleteBlock.mutate(id, {
      onSuccess: () => toast.success("Block removed"),
    });
  }

  // Group data by day
  type TimeBlock = WeekCalendarData["timeBlocks"][number];
  type CalendarEvent = WeekCalendarData["calendarEvents"][number];
  const timeBlocksByDay = new Map<string, TimeBlock[]>();
  const eventsByDay = new Map<string, CalendarEvent[]>();
  const allDayByDay = new Map<string, CalendarEvent[]>();

  if (data) {
    for (const block of data.timeBlocks || []) {
      const key = localDateStr(new Date(block.date));
      if (!timeBlocksByDay.has(key)) timeBlocksByDay.set(key, []);
      timeBlocksByDay.get(key)!.push(block);
    }
    for (const evt of data.calendarEvents || []) {
      if (evt.isAllDay) {
        // All-day events go into their own map
        const startKey = localDateStr(new Date(evt.startTime));
        if (!allDayByDay.has(startKey)) allDayByDay.set(startKey, []);
        allDayByDay.get(startKey)!.push(evt);
      } else {
        const startKey = localDateStr(new Date(evt.startTime));
        if (!eventsByDay.has(startKey)) eventsByDay.set(startKey, []);
        eventsByDay.get(startKey)!.push(evt);
      }
    }
  }

  const weekEndLabel = addDays(weekStart, 6);
  const monthLabel = weekStart.getMonth() === weekEndLabel.getMonth()
    ? weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : `${weekStart.toLocaleDateString("en-US", { month: "short" })} - ${weekEndLabel.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <span className="text-muted-foreground">{monthLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart(getMonday(new Date()))}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleAutoSchedule}
            disabled={autoSchedule.isPending}
          >
            {autoSchedule.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Auto-schedule
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex border-b border-border">
        <div style={{ width: 60 }} />
        {days.map((day) => {
          const isToday = day.getTime() === today.getTime();
          return (
            <div key={day.toISOString()} className="flex-1 text-center py-2 border-l border-border">
              <div className="text-xs text-muted-foreground uppercase">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isToday ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events banner */}
      {data && Array.from(allDayByDay.values()).some((v) => v.length > 0) && (
        <div className="flex border-b border-border">
          <div style={{ width: 60 }} className="text-[10px] text-muted-foreground text-right pr-2 py-1">
            all-day
          </div>
          {days.map((day) => {
            const dayKey = formatDate(day);
            const allDay = allDayByDay.get(dayKey) || [];
            return (
              <div key={`ad-${day.toISOString()}`} className="flex-1 border-l border-border px-0.5 py-0.5 space-y-0.5 max-h-16 overflow-hidden">
                {allDay.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium truncate bg-primary/10 text-primary border border-primary/20"
                    title={evt.title}
                  >
                    {evt.title}
                  </div>
                ))}
                {allDay.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{allDay.length - 3} more</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scrollable grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading calendar...
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="flex" style={{ minHeight: GRID_HEIGHT }}>
            <CalendarHourLabels />
            {days.map((day) => {
              const dayKey = formatDate(day);
              const isToday = day.getTime() === today.getTime();
              return (
                <div key={day.toISOString()} className="flex-1">
                  <CalendarDayColumn
                    date={day}
                    timeBlocks={timeBlocksByDay.get(dayKey) || []}
                    calendarEvents={eventsByDay.get(dayKey) || []}
                    schedules={data?.schedules || []}
                    isToday={isToday}
                    onDeleteBlock={handleDeleteBlock}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
