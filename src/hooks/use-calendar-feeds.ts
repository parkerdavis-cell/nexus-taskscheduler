"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCalendarFeedInput, UpdateCalendarFeedInput } from "@/lib/validations";

export function useCalendarFeeds() {
  return useQuery({
    queryKey: ["calendar-feeds"],
    queryFn: async () => {
      const res = await fetch("/api/calendar-feeds");
      if (!res.ok) throw new Error("Failed to fetch calendar feeds");
      return res.json();
    },
  });
}

export function useCreateCalendarFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCalendarFeedInput) => {
      const res = await fetch("/api/calendar-feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create calendar feed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-feeds"] });
    },
  });
}

export function useUpdateCalendarFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCalendarFeedInput & { id: string }) => {
      const res = await fetch(`/api/calendar-feeds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update calendar feed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-feeds"] });
    },
  });
}

export function useDeleteCalendarFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar-feeds/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete calendar feed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-feeds"] });
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}

export function useSyncCalendarFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar-feeds/${id}/sync`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync feed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-feeds"] });
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}

export function useSyncAllCalendarFeeds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/calendar-feeds/sync-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync feeds");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-feeds"] });
      qc.invalidateQueries({ queryKey: ["week-calendar"] });
    },
  });
}
