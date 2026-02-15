"use client";

import Link from "next/link";
import { Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PacingIndicator } from "./pacing-indicator";
import { formatShortDate, daysUntil } from "@/lib/date-utils";
import { GOAL_STATUS_LABELS, GOAL_PRIORITY_COLORS } from "@/types";
import type { GoalWithRelations } from "@/hooks/use-goals";
import type { GoalStatus, GoalPriority } from "@/types";

export function GoalCard({ goal }: { goal: GoalWithRelations }) {
  const total = goal.totalTaskCount ?? goal._count.tasks;
  const completed = goal.completedTaskCount ?? 0;

  let progress: number;
  if (goal.progressType === "TASK_COUNT") {
    progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  } else if (goal.progressType === "PERCENTAGE") {
    progress = Math.min(100, goal.currentValue);
  } else {
    progress = goal.targetValue > 0
      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
      : 0;
  }

  // Deadline pressure
  const daysLeft = goal.targetDate ? daysUntil(goal.targetDate) : null;
  let deadlineColor = "text-muted-foreground";
  if (daysLeft !== null) {
    if (daysLeft < 0) deadlineColor = "text-red-500";
    else if (daysLeft <= 3) deadlineColor = "text-red-500";
    else if (daysLeft <= 7) deadlineColor = "text-orange-500";
    else if (daysLeft <= 14) deadlineColor = "text-yellow-500";
  }

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="transition-colors hover:bg-card/80 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: goal.workspace.color + "20" }}
              >
                <Target
                  className="h-4 w-4"
                  style={{ color: goal.workspace.color }}
                />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  {goal.title}
                </CardTitle>
                <p
                  className="text-xs"
                  style={{ color: goal.workspace.color }}
                >
                  {goal.workspace.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {goal.priority !== "MEDIUM" && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ color: GOAL_PRIORITY_COLORS[goal.priority as GoalPriority] }}
                >
                  {goal.priority}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {GOAL_STATUS_LABELS[goal.status as GoalStatus]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {goal.description && (
            <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {goal.progressType === "TASK_COUNT"
                  ? `${completed} / ${total} tasks`
                  : goal.progressType === "PERCENTAGE"
                    ? `${goal.currentValue}%`
                    : `${goal.currentValue} / ${goal.targetValue}`}
              </span>
              <div className="flex items-center gap-1.5">
                <PacingIndicator
                  targetDate={goal.targetDate}
                  createdAt={goal.createdAt}
                  currentProgress={progress}
                  compact
                />
                <span className="font-medium">{progress}%</span>
              </div>
            </div>
            <Progress
              value={progress}
              className="h-2"
              style={{
                // @ts-expect-error CSS variable
                "--progress-foreground": goal.workspace.color,
              }}
            />
          </div>

          {goal.targetDate && (
            <div className={`mt-2 flex items-center gap-1 text-xs ${deadlineColor}`}>
              <Calendar className="h-3 w-3" />
              {daysLeft !== null && daysLeft < 0
                ? `Overdue by ${Math.abs(daysLeft)} days`
                : daysLeft === 0
                  ? "Due today"
                  : daysLeft !== null && daysLeft <= 14
                    ? `${daysLeft} days left`
                    : `Target: ${formatShortDate(goal.targetDate)}`}
            </div>
          )}

          {goal.milestones.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {goal.milestones.filter((m) => m.isCompleted).length}/
              {goal.milestones.length} milestones
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
