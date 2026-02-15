"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** Local-timezone date string (YYYY-MM-DD) — avoids UTC date drift */
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface WeekCalendarData {
  timeBlocks: Array<{
    id: string;
    startTime: string;
    endTime: string;
    title: string | null;
    description: string | null;
    color: string | null;
    status: string;
    date: string;
    isAutoScheduled: boolean;
    chunkIndex: number | null;
    chunkTotal: number | null;
    task: {
      id: string;
      title: string;
      priority: string;
      status: string;
      workspaceId: string;
      assignee?: string;
      workspace?: { color: string };
    } | null;
  }>;
  calendarEvents: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startTime: string;
    endTime: string;
    busyStatus: string;
    isAllDay: boolean;
    calendarUrl?: string | null;
    feedColor?: string | null;
    feedName?: string | null;
  }>;
  schedules: Array<{
    id: string;
    name: string;
    color: string;
    windows: Array<{
      id: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      scheduleId: string;
    }>;
  }>;
}

export function useWeekCalendar(weekStart: Date) {
  const start = formatDate(weekStart);
  return useQuery<WeekCalendarData>({
    queryKey: ["week-calendar", start],
    queryFn: async () => {
      const res = await fetch(`/api/calendar/week?start=${start}`);
      if (!res.ok) throw new Error("Failed to fetch calendar data");
      return res.json() as Promise<WeekCalendarData>;
    },
  });
}

export function useAutoSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { startDate: string; endDate: string; dryRun?: boolean }) => {
      const res = await fetch("/api/calendar/auto-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to auto-schedule");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}
