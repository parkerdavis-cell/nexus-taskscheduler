"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks, type TaskWithRelations } from "@/hooks/use-tasks";
import { PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/types";
import type { TaskPriority, TaskStatus } from "@/types";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const [date, setDate] = useState(new Date());

  const dateStr = format(date, "yyyy-MM-dd");
  const { data: tasks } = useTasks({});

  // Filter tasks for the selected date
  const dayTasks = (tasks || []).filter((task) => {
    if (!task.dueDate) return false;
    return format(new Date(task.dueDate), "yyyy-MM-dd") === dateStr;
  });

  // Unscheduled tasks (no due date, active)
  const unscheduled = (tasks || []).filter(
    (task) => !task.dueDate && task.status !== "DONE" && task.status !== "ARCHIVED"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Day Planner</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(subDays(date, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(new Date())}
          >
            Today
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {formatDate(date)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDate(addDays(date, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Tasks for {format(date, "EEEE, MMM d")}
                {dayTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {dayTasks.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            PRIORITY_COLORS[task.priority as TaskPriority],
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            task.status === "DONE" && "line-through opacity-60"
                          )}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px]"
                            style={{ color: task.workspace.color }}
                          >
                            {task.workspace.name}
                          </span>
                          {task.estimatedMins && (
                            <span className="text-[10px] text-muted-foreground">
                              {task.estimatedMins}m
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          borderColor: STATUS_COLORS[task.status as TaskStatus],
                          color: STATUS_COLORS[task.status as TaskStatus],
                        }}
                      >
                        {STATUS_LABELS[task.status as TaskStatus]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No tasks scheduled for this day
                </p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Unscheduled sidebar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Unscheduled
              {unscheduled.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unscheduled.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {unscheduled.slice(0, 20).map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        PRIORITY_COLORS[task.priority as TaskPriority],
                    }}
                  />
                  <span className="truncate">{task.title}</span>
                </Link>
              ))}
              {unscheduled.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  All tasks have due dates
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
