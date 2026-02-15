"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations";

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  sortOrder: number;
  dueDate: string | null;
  estimatedMins: number | null;
  completedAt: string | null;
  agentBrief: string | null;
  createdBy: string;
  assignee: string;
  minChunkMins: number | null;
  isHardDeadline: boolean;
  autoSchedule: boolean;
  scheduleId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  workspaceId: string;
  goalId: string | null;
  workspace: { id: string; name: string; slug: string; color: string; icon: string };
  goal: { id: string; title: string } | null;
  schedule: { id: string; name: string; color: string } | null;
  timeBlocks?: { id: string; date: string; startTime: string; endTime: string; chunkIndex: number | null; chunkTotal: number | null; isAutoScheduled: boolean }[];
  _count?: { activities: number; timeBlocks?: number };
}

export interface TaskFilters {
  workspace?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
  goalId?: string;
}

export function useTasks(filters: TaskFilters = {}) {
  const params = new URLSearchParams();
  if (filters.workspace) params.set("workspace", filters.workspace);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assignee) params.set("assignee", filters.assignee);
  if (filters.search) params.set("search", filters.search);
  if (filters.goalId) params.set("goalId", filters.goalId);

  return useQuery<TaskWithRelations[]>({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });
}

export function useTask(id: string) {
  return useQuery<TaskWithRelations>({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateTaskInput) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export interface TaskActivity {
  id: string;
  type: string;
  content: string;
  author: string;
  metadata: string | null;
  createdAt: string;
}

export function useTaskActivities(taskId: string) {
  return useQuery<TaskActivity[]>({
    queryKey: ["task-activities", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/activity`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
    enabled: !!taskId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      ...data
    }: {
      taskId: string;
      type?: string;
      content: string;
      author?: string;
    }) => {
      const res = await fetch(`/api/tasks/${taskId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create activity");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task-activities", variables.taskId],
      });
    },
  });
}
