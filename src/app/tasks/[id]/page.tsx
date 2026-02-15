"use client";

import { use } from "react";
import { TaskDetail } from "@/components/tasks/task-detail";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TaskDetail taskId={id} />;
}
