import { prisma } from "@/lib/db";

interface TimeSlot {
  date: Date;
  start: number; // minutes from midnight
  end: number;
  scheduleIds: string[]; // which schedules overlap this slot
}

interface TaskToSchedule {
  id: string;
  title: string;
  priority: string;
  estimatedMins: number;
  dueDate: Date | null;
  isHardDeadline: boolean;
  minChunkMins: number | null;
  scheduleId: string | null;
  scheduledMins: number; // already scheduled time
  goalDeadline: Date | null;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  URGENT: 0,
  HIGH: 100,
  MEDIUM: 200,
  LOW: 300,
  BACKLOG: 400,
};

const DAY_START = 6 * 60; // 6:00 AM in minutes
const DAY_END = 22 * 60; // 10:00 PM in minutes
const SNAP = 15; // snap to 15-minute boundaries

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function snapUp(mins: number): number {
  return Math.ceil(mins / SNAP) * SNAP;
}

function snapDown(mins: number): number {
  return Math.floor(mins / SNAP) * SNAP;
}

/** Local-timezone date key (YYYY-MM-DD) — matches localDateStr in calendar-constants */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Parse YYYY-MM-DD as local midnight (not UTC) */
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function generateSchedule(
  startDate: Date,
  endDate: Date,
  dryRun: boolean = false
) {
  // Clamp startDate to today — never schedule in the past
  const now = new Date();
  const todayStart = startOfDay(now);
  const effectiveStart = startDate < todayStart ? todayStart : startDate;

  // Step 1: Gather inputs
  const [tasks, calendarEvents, manualBlocks, schedules, existingAutoBlocks, pastAutoBlocks] = await Promise.all([
    prisma.task.findMany({
      where: {
        autoSchedule: true,
        estimatedMins: { not: null },
        status: { in: ["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"] },
        deletedAt: null,
      },
      include: {
        timeBlocks: {
          where: { isAutoScheduled: false },
          select: { startTime: true, endTime: true },
        },
        goal: {
          select: { targetDate: true },
        },
      },
    }),
    prisma.calendarEvent.findMany({
      where: {
        startTime: { lt: endDate },
        endTime: { gt: effectiveStart },
        busyStatus: "BUSY",
      },
    }),
    prisma.timeBlock.findMany({
      where: {
        date: { gte: effectiveStart, lt: endDate },
        isAutoScheduled: false,
      },
    }),
    prisma.schedule.findMany({
      include: { windows: true },
    }),
    prisma.timeBlock.findMany({
      where: {
        date: { gte: effectiveStart, lt: endDate },
        isAutoScheduled: true,
      },
      select: { id: true },
    }),
    // Also find past auto-blocks to clean up
    prisma.timeBlock.findMany({
      where: {
        date: { lt: todayStart },
        isAutoScheduled: true,
      },
      select: { id: true },
    }),
  ]);

  // Calculate already-scheduled time for each task (manual blocks only)
  const tasksToSchedule: TaskToSchedule[] = tasks
    .filter((t) => t.estimatedMins !== null)
    .map((t) => {
      const scheduledMins = t.timeBlocks.reduce((sum, b) => {
        return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
      }, 0);
      return {
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedMins: t.estimatedMins!,
        dueDate: t.dueDate,
        isHardDeadline: t.isHardDeadline,
        minChunkMins: t.minChunkMins,
        scheduleId: t.scheduleId,
        scheduledMins,
        goalDeadline: t.goal?.targetDate ?? null,
      };
    })
    .filter((t) => t.estimatedMins > t.scheduledMins); // only tasks needing more time

  // Step 2: Build available time slots per day
  const days: Date[] = [];
  const d = startOfDay(effectiveStart);
  while (d < endDate) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  // Build schedule window lookup: dayOfWeek -> [{start, end, scheduleId}]
  const scheduleWindows = new Map<number, { start: number; end: number; scheduleId: string }[]>();
  for (const schedule of schedules) {
    for (const w of schedule.windows) {
      const existing = scheduleWindows.get(w.dayOfWeek) || [];
      existing.push({
        start: timeToMinutes(w.startTime),
        end: timeToMinutes(w.endTime),
        scheduleId: schedule.id,
      });
      scheduleWindows.set(w.dayOfWeek, existing);
    }
  }

  // For each day, build free intervals (single unified pool)
  // Each day gets one set of free intervals with schedule overlap tags
  const dayFreeIntervals = new Map<string, { start: number; end: number }[]>();
  const dayScheduleWindows = new Map<string, { start: number; end: number; scheduleId: string }[]>();

  for (const day of days) {
    const dayStr = dateKey(day);
    const dow = day.getDay();

    // Start with full day slot
    let freeIntervals: { start: number; end: number }[] = [{ start: DAY_START, end: DAY_END }];

    // Subtract calendar events (using local dates for day matching)
    for (const evt of calendarEvents) {
      const evtStart = new Date(evt.startTime);
      const evtEnd = new Date(evt.endTime);
      const evtStartDay = dateKey(evtStart);
      const evtEndDay = dateKey(evtEnd);

      if (evtStartDay !== dayStr && evtEndDay !== dayStr) {
        // Check if multi-day event covers this day entirely
        if (evtStart <= day && evtEnd >= new Date(day.getTime() + 86400000)) {
          freeIntervals = [];
          break;
        }
        continue;
      }

      const busyStart = evtStartDay === dayStr
        ? snapDown(evtStart.getHours() * 60 + evtStart.getMinutes())
        : DAY_START;
      const busyEnd = evtEndDay === dayStr
        ? snapUp(evtEnd.getHours() * 60 + evtEnd.getMinutes())
        : DAY_END;

      if (busyStart < busyEnd) {
        freeIntervals = subtractInterval(freeIntervals, busyStart, busyEnd);
      }
    }

    // Subtract manual time blocks
    for (const block of manualBlocks) {
      if (dateKey(new Date(block.date)) !== dayStr) continue;
      const busyStart = timeToMinutes(block.startTime);
      const busyEnd = timeToMinutes(block.endTime);
      freeIntervals = subtractInterval(freeIntervals, busyStart, busyEnd);
    }

    dayFreeIntervals.set(dayStr, freeIntervals);
    dayScheduleWindows.set(dayStr, scheduleWindows.get(dow) || []);
  }

  // Filter out past time for today
  const todayStr = dateKey(now);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const earliest = snapUp(nowMins);

  const todayIntervals = dayFreeIntervals.get(todayStr);
  if (todayIntervals) {
    const filtered: { start: number; end: number }[] = [];
    for (const iv of todayIntervals) {
      if (iv.end <= earliest) continue;
      filtered.push({
        start: Math.max(iv.start, earliest),
        end: iv.end,
      });
    }
    dayFreeIntervals.set(todayStr, filtered);
  }

  // Step 3: Sort tasks by priority (highest first)
  tasksToSchedule.sort((a, b) => {
    let scoreA = PRIORITY_WEIGHT[a.priority] ?? 200;
    let scoreB = PRIORITY_WEIGHT[b.priority] ?? 200;

    // Deadline proximity bonus
    if (a.dueDate) {
      const daysUntil = Math.max(0, (a.dueDate.getTime() - now.getTime()) / 86400000);
      scoreA -= Math.max(0, 50 - daysUntil * 5);
    }
    if (b.dueDate) {
      const daysUntil = Math.max(0, (b.dueDate.getTime() - now.getTime()) / 86400000);
      scoreB -= Math.max(0, 50 - daysUntil * 5);
    }

    // Hard deadline tasks get massive priority boost
    if (a.isHardDeadline) scoreA -= 1000;
    if (b.isHardDeadline) scoreB -= 1000;

    // Goal deadline proximity bonus
    if (a.goalDeadline) {
      const daysUntilGoal = Math.max(0, (a.goalDeadline.getTime() - now.getTime()) / 86400000);
      scoreA -= Math.max(0, 30 - daysUntilGoal * 3);
    }
    if (b.goalDeadline) {
      const daysUntilGoal = Math.max(0, (b.goalDeadline.getTime() - now.getTime()) / 86400000);
      scoreB -= Math.max(0, 30 - daysUntilGoal * 3);
    }

    return scoreA - scoreB;
  });

  // Step 4: Place tasks into the unified slot pool
  // For each task, we scan the day free intervals and find suitable time.
  // When a task has a scheduleId, we only consider time within that schedule's windows.
  // When a task is placed, we subtract from the shared free intervals so no double-booking.
  const placed: {
    taskId: string;
    date: Date;
    startTime: string;
    endTime: string;
    chunkIndex: number | null;
    chunkTotal: number | null;
  }[] = [];
  const unplaceable: { id: string; title: string; reason: string }[] = [];

  for (const task of tasksToSchedule) {
    const remaining = task.estimatedMins - task.scheduledMins;

    if (task.minChunkMins && remaining > task.minChunkMins) {
      // Chunked task: spread across days (one chunk per day)
      const chunkSize = Math.max(task.minChunkMins, SNAP);
      const totalChunks = Math.ceil(remaining / chunkSize);
      let chunksPlaced = 0;

      for (const day of days) {
        if (chunksPlaced >= totalChunks) break;

        const dayStr = dateKey(day);

        // Due date constraint
        if (task.dueDate && day > task.dueDate && !task.isHardDeadline) continue;

        const thisChunkSize = chunksPlaced === totalChunks - 1
          ? remaining - chunksPlaced * chunkSize
          : chunkSize;

        const result = findAndConsumeSlot(
          dayFreeIntervals, dayScheduleWindows, dayStr,
          task.scheduleId, snapUp(thisChunkSize)
        );

        if (result) {
          placed.push({
            taskId: task.id,
            date: day,
            startTime: minutesToTime(result.start),
            endTime: minutesToTime(result.end),
            chunkIndex: chunksPlaced,
            chunkTotal: totalChunks,
          });
          chunksPlaced++;
        }
      }

      if (chunksPlaced < totalChunks) {
        unplaceable.push({
          id: task.id,
          title: task.title,
          reason: `Only placed ${chunksPlaced}/${totalChunks} chunks`,
        });
      }
    } else {
      // Non-chunked: find first contiguous slot big enough
      let didPlace = false;
      const needed = snapUp(remaining);

      for (const day of days) {
        const dayStr = dateKey(day);

        // Due date constraint
        if (task.dueDate && day > task.dueDate && !task.isHardDeadline) continue;

        const result = findAndConsumeSlot(
          dayFreeIntervals, dayScheduleWindows, dayStr,
          task.scheduleId, needed
        );

        if (result) {
          placed.push({
            taskId: task.id,
            date: day,
            startTime: minutesToTime(result.start),
            endTime: minutesToTime(result.end),
            chunkIndex: null,
            chunkTotal: null,
          });
          didPlace = true;
          break;
        }
      }

      if (!didPlace) {
        unplaceable.push({
          id: task.id,
          title: task.title,
          reason: "No contiguous slot large enough",
        });
      }
    }
  }

  // Step 5 & 6: Persist (unless dry run)
  if (!dryRun) {
    // Delete existing auto-scheduled blocks in range + any past auto-blocks
    const blocksToDelete = [...existingAutoBlocks, ...pastAutoBlocks];
    if (blocksToDelete.length > 0) {
      await prisma.timeBlock.deleteMany({
        where: { id: { in: blocksToDelete.map((b) => b.id) } },
      });
    }

    // Create new blocks
    if (placed.length > 0) {
      await prisma.timeBlock.createMany({
        data: placed.map((p) => ({
          taskId: p.taskId,
          date: p.date,
          startTime: p.startTime,
          endTime: p.endTime,
          isAutoScheduled: true,
          chunkIndex: p.chunkIndex,
          chunkTotal: p.chunkTotal,
          createdBy: "agent",
        })),
      });
    }
  }

  return { placed, unplaceable, dryRun };
}

/**
 * Find a slot of at least `needed` minutes in the day's free intervals,
 * optionally constrained to a schedule's windows. Consumes the time from
 * the shared free interval pool so subsequent calls see it as unavailable.
 */
function findAndConsumeSlot(
  dayFreeIntervals: Map<string, { start: number; end: number }[]>,
  dayScheduleWindows: Map<string, { start: number; end: number; scheduleId: string }[]>,
  dayStr: string,
  scheduleId: string | null,
  needed: number,
): { start: number; end: number } | null {
  const intervals = dayFreeIntervals.get(dayStr);
  if (!intervals || intervals.length === 0) return null;

  const windows = dayScheduleWindows.get(dayStr) || [];

  if (scheduleId) {
    // Task must be placed within its schedule's windows
    // Find the first window for this schedule that has enough contiguous free time
    const matchingWindows = windows.filter((w) => w.scheduleId === scheduleId);

    for (const win of matchingWindows) {
      // Intersect the schedule window with the free intervals to find available sub-ranges
      for (let i = 0; i < intervals.length; i++) {
        const iv = intervals[i];
        const clipStart = Math.max(iv.start, win.start);
        const clipEnd = Math.min(iv.end, win.end);
        const available = clipEnd - clipStart;

        if (available >= needed) {
          const blockEnd = clipStart + needed;
          // Consume from the shared free intervals
          consumeFromIntervals(intervals, clipStart, blockEnd);
          // Clean up empty intervals
          dayFreeIntervals.set(dayStr, intervals.filter((x) => x.end > x.start));
          return { start: clipStart, end: blockEnd };
        }
      }
    }
    return null;
  } else {
    // No schedule constraint — place in earliest free time
    for (let i = 0; i < intervals.length; i++) {
      const iv = intervals[i];
      const available = iv.end - iv.start;

      if (available >= needed) {
        const blockEnd = iv.start + needed;
        consumeFromIntervals(intervals, iv.start, blockEnd);
        dayFreeIntervals.set(dayStr, intervals.filter((x) => x.end > x.start));
        return { start: iv.start, end: blockEnd };
      }
    }
    return null;
  }
}

/** Remove a time range from the interval list (mutates in place). */
function consumeFromIntervals(
  intervals: { start: number; end: number }[],
  busyStart: number,
  busyEnd: number
) {
  const updated = subtractInterval(intervals, busyStart, busyEnd);
  intervals.length = 0;
  intervals.push(...updated);
}

function subtractInterval(
  intervals: { start: number; end: number }[],
  busyStart: number,
  busyEnd: number
): { start: number; end: number }[] {
  const result: { start: number; end: number }[] = [];
  for (const interval of intervals) {
    if (busyEnd <= interval.start || busyStart >= interval.end) {
      result.push(interval);
    } else {
      if (interval.start < busyStart) {
        result.push({ start: interval.start, end: busyStart });
      }
      if (interval.end > busyEnd) {
        result.push({ start: busyEnd, end: interval.end });
      }
    }
  }
  return result;
}
