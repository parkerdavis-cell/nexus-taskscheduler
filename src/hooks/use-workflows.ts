"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateWorkflowInput, UpdateWorkflowInput } from "@/lib/validations";

export interface WorkflowStep {
  id: string;
  workflowId: string;
  sortOrder: number;
  title: string;
  stepType: string;
  instruction: string;
  toolName: string | null;
  toolParams: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowWithSteps {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  steps: WorkflowStep[];
  _count?: { steps: number };
}

export function useWorkflows() {
  return useQuery<WorkflowWithSteps[]>({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
  });
}

export function useWorkflow(id: string) {
  return useQuery<WorkflowWithSteps>({
    queryKey: ["workflow", id],
    queryFn: async () => {
      const res = await fetch(`/api/workflows/${id}`);
      if (!res.ok) throw new Error("Failed to fetch workflow");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkflowInput) => {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateWorkflowInput) => {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update workflow");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", variables.id] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete workflow");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}
