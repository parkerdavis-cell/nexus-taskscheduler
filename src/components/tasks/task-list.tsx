"use client";

import { TaskCard } from "./task-card";
import { PRIORITY_ORDER, PRIORITY_COLORS } from "@/types";
import type { TaskWithRelations } from "@/hooks/use-tasks";
import type { TaskPriority } from "@/types";

export function TaskList({ tasks }: { tasks: TaskWithRelations[] }) {
  // Group by priority
  const grouped = tasks.reduce<Record<string, TaskWithRelations[]>>(
    (acc, task) => {
      const key = task.priority;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    },
    {}
  );

  const sortedPriorities = Object.keys(grouped).sort(
    (a, b) => (PRIORITY_ORDER[a as TaskPriority] ?? 99) - (PRIORITY_ORDER[b as TaskPriority] ?? 99)
  );

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm">Create a task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedPriorities.map((priority) => (
        <div key={priority}>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: PRIORITY_COLORS[priority as TaskPriority],
              }}
            />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {priority} ({grouped[priority].length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {grouped[priority].map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
