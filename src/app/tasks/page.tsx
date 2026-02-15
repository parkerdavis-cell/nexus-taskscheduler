"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFiltersBar } from "@/components/tasks/task-filters";
import { TaskFormDialog } from "@/components/tasks/task-form";
import { useTasks, type TaskFilters } from "@/hooks/use-tasks";

function TasksContent() {
  const searchParams = useSearchParams();
  const initialWorkspace = searchParams.get("workspace") || undefined;

  const [filters, setFilters] = useState<TaskFilters>({
    workspace: initialWorkspace,
  });

  const { data: tasks, isLoading } = useTasks(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <TaskFormDialog />
      </div>

      <TaskFiltersBar filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading tasks...</div>
      ) : (
        <TaskList tasks={tasks || []} />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
}
