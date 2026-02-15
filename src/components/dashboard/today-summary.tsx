"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpdateTask, type TaskWithRelations } from "@/hooks/use-tasks";
import { PRIORITY_COLORS } from "@/types";
import type { TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/date-utils";

interface TimeBlockItem {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  title: string | null;
  task: { id: string; title: string; status: string } | null;
}

export function TodaySummary({
  tasks,
  timeBlocks,
}: {
  tasks: TaskWithRelations[];
  timeBlocks: TimeBlockItem[];
}) {
  const updateTask = useUpdateTask();

  const hasSchedule = timeBlocks.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Today&apos;s Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasSchedule ? (
          timeBlocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm"
            >
              <span className="w-20 shrink-0 text-xs text-muted-foreground">
                {formatTime(block.startTime)}
              </span>
              <span className="flex-1 truncate">
                {block.task?.title || block.title || "Free time"}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {block.status}
              </Badge>
            </div>
          ))
        ) : tasks.length > 0 ? (
          tasks.map((task) => {
            const isDone = task.status === "DONE";
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 shrink-0"
                  onClick={() =>
                    updateTask.mutate({
                      id: task.id,
                      status: isDone ? "TODO" : "DONE",
                    })
                  }
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Link
                  href={`/tasks/${task.id}`}
                  className={cn(
                    "flex-1 truncate text-sm hover:text-primary",
                    isDone && "line-through opacity-60"
                  )}
                >
                  {task.title}
                </Link>
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority as TaskPriority] }}
                />
              </div>
            );
          })
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tasks for today
          </p>
        )}
      </CardContent>
    </Card>
  );
}
