"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTimeBlockInput, UpdateTimeBlockInput } from "@/lib/validations";

export function useCreateTimeBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTimeBlockInput) => {
      const res = await fetch("/api/time-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create time block");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}

export function useUpdateTimeBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTimeBlockInput & { id: string }) => {
      const res = await fetch(`/api/time-blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update time block");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}

export function useDeleteTimeBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/time-blocks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete time block");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}
