"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateGoalInput, UpdateGoalInput } from "@/lib/validations";

export interface GoalCheckIn {
  id: string;
  value: number;
  note: string | null;
  createdAt: string;
}

export interface MilestoneWithKeyResult {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  sortOrder: number;
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
}

export interface GoalWithRelations {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  progressType: string;
  targetValue: number;
  currentValue: number;
  priority: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  workspace: { id: string; name: string; slug: string; color: string; icon: string };
  _count: { tasks: number };
  milestones: MilestoneWithKeyResult[];
  completedTaskCount?: number;
  totalTaskCount?: number;
  timeInvestedMins?: number;
  checkIns?: GoalCheckIn[];
}

export function useGoals(workspaceId?: string, status?: string) {
  const params = new URLSearchParams();
  if (workspaceId) params.set("workspaceId", workspaceId);
  if (status) params.set("status", status);

  return useQuery<GoalWithRelations[]>({
    queryKey: ["goals", workspaceId, status],
    queryFn: async () => {
      const res = await fetch(`/api/goals?${params}`);
      if (!res.ok) throw new Error("Failed to fetch goals");
      return res.json();
    },
  });
}

export function useGoal(id: string) {
  return useQuery<GoalWithRelations>({
    queryKey: ["goal", id],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) throw new Error("Failed to fetch goal");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGoalInput) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateGoalInput) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Milestone hooks

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      ...data
    }: {
      goalId: string;
      title: string;
      targetDate?: string;
      description?: string;
      targetValue?: number;
      unit?: string;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create milestone");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      milestoneId,
      ...data
    }: {
      goalId: string;
      milestoneId: string;
      title?: string;
      targetDate?: string | null;
      isCompleted?: boolean;
      description?: string | null;
      targetValue?: number | null;
      currentValue?: number;
      unit?: string | null;
      sortOrder?: number;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update milestone");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useToggleMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      milestoneId,
      isCompleted,
    }: {
      goalId: string;
      milestoneId: string;
      isCompleted: boolean;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) throw new Error("Failed to update milestone");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      milestoneId,
    }: {
      goalId: string;
      milestoneId: string;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete milestone");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

// Check-in hooks

export function useCheckIns(goalId: string) {
  return useQuery<GoalCheckIn[]>({
    queryKey: ["check-ins", goalId],
    queryFn: async () => {
      const res = await fetch(`/api/goals/${goalId}/check-ins`);
      if (!res.ok) throw new Error("Failed to fetch check-ins");
      return res.json();
    },
    enabled: !!goalId,
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      ...data
    }: {
      goalId: string;
      value: number;
      note?: string;
    }) => {
      const res = await fetch(`/api/goals/${goalId}/check-ins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create check-in");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["check-ins", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
