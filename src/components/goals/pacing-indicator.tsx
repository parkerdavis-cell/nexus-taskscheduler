"use client";

import { Badge } from "@/components/ui/badge";
import { differenceInDays, startOfDay } from "date-fns";

interface PacingIndicatorProps {
  targetDate: string | null;
  createdAt: string;
  currentProgress: number; // 0-100 normalized
  compact?: boolean;
}

export function PacingIndicator({
  targetDate,
  createdAt,
  currentProgress,
  compact = false,
}: PacingIndicatorProps) {
  if (!targetDate) return null;

  const now = startOfDay(new Date());
  const start = startOfDay(new Date(createdAt));
  const end = startOfDay(new Date(targetDate));

  const totalDays = differenceInDays(end, start);
  const elapsedDays = differenceInDays(now, start);

  if (totalDays <= 0) return null;

  const expectedProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const diff = currentProgress - expectedProgress;

  let label: string;
  let color: string;

  if (elapsedDays > totalDays) {
    if (currentProgress >= 100) {
      label = "Complete";
      color = "text-green-500 bg-green-500/10 border-green-500/20";
    } else {
      label = "Overdue";
      color = "text-red-500 bg-red-500/10 border-red-500/20";
    }
  } else if (diff >= 10) {
    label = "Ahead";
    color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
  } else if (diff <= -10) {
    label = "Behind";
    color = "text-red-500 bg-red-500/10 border-red-500/20";
  } else {
    label = "On Track";
    color = "text-green-500 bg-green-500/10 border-green-500/20";
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
        {label}
      </span>
    );
  }

  return (
    <Badge variant="outline" className={color}>
      {label} ({currentProgress}% vs {expectedProgress}% expected)
    </Badge>
  );
}
