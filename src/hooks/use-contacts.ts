"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateContactInput, UpdateContactInput } from "@/lib/validations";

export interface ContactWithWorkspace {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
  workspace: { id: string; name: string; slug: string; color: string; icon: string } | null;
}

export interface ContactFilters {
  workspace?: string;
  search?: string;
}

export function useContacts(filters: ContactFilters = {}) {
  const params = new URLSearchParams();
  if (filters.workspace) params.set("workspace", filters.workspace);
  if (filters.search) params.set("search", filters.search);

  return useQuery<ContactWithWorkspace[]>({
    queryKey: ["contacts", filters],
    queryFn: async () => {
      const res = await fetch(`/api/contacts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateContactInput) => {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateContactInput) => {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
