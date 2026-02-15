"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, Clock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate, isOverdue, daysUntil } from "@/lib/date-utils";
import { PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/types";
import { useUpdateTask, type TaskWithRelations } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types";

export function TaskCard({ task }: { task: TaskWithRelations }) {
  const updateTask = useUpdateTask();
  const priorityColor = PRIORITY_COLORS[task.priority as TaskPriority];
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const isDone = task.status === "DONE";

  // At-risk: task has a deadline and estimated time suggests it can't be finished in time
  // ~8 working hours per day available
  const atRisk = !isDone && task.dueDate && task.estimatedMins
    ? daysUntil(task.dueDate) * 8 * 60 < task.estimatedMins
    : false;

  const toggleDone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateTask.mutate({
      id: task.id,
      status: isDone ? "TODO" : "DONE",
    });
  };

  return (
    <Link href={`/tasks/${task.id}`} className="block">
      <div
        className={cn(
          "group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-card/80",
          isDone && "opacity-60"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 h-5 w-5 shrink-0 p-0"
          onClick={toggleDone}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: task.workspace.color }}
            />
            <span
              className={cn(
                "truncate text-sm font-medium",
                isDone && "line-through"
              )}
            >
              {task.title}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-xs" style={{ color: task.workspace.color }}>
              {task.workspace.name}
            </span>

            {task.dueDate && (
              <span className={cn(
                "flex items-center gap-1",
                overdue && "text-destructive font-medium",
                !overdue && atRisk && "text-amber-500 font-medium"
              )}>
                {(overdue || atRisk) ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {formatShortDate(task.dueDate)}
              </span>
            )}

            {task.estimatedMins && (
              <span>{task.estimatedMins}m</span>
            )}

            {(task._count?.activities ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task._count?.activities}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0"
            style={{ borderColor: priorityColor, color: priorityColor }}
          >
            {task.priority}
          </Badge>
          {task.status !== "TODO" && task.status !== "DONE" && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{
                borderColor: STATUS_COLORS[task.status as TaskStatus],
                color: STATUS_COLORS[task.status as TaskStatus],
              }}
            >
              {STATUS_LABELS[task.status as TaskStatus]}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
