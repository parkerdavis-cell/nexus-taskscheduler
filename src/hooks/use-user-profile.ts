"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useUserName() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/settings/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<{ name: string }>;
    },
  });
}

export function useUpdateUserName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update name");
      return res.json() as Promise<{ name: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}
