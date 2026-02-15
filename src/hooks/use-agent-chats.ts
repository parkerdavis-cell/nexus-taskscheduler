"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AgentMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  chatId: string;
}

export interface AgentChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AgentMessage[];
}

export function useAgentChats() {
  return useQuery<AgentChat[]>({
    queryKey: ["agent-chats"],
    queryFn: async () => {
      const res = await fetch("/api/agent-chats");
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    },
  });
}

export function useAgentChat(id: string | null) {
  return useQuery<AgentChat & { messages: AgentMessage[] }>({
    queryKey: ["agent-chat", id],
    queryFn: async () => {
      const res = await fetch(`/api/agent-chats/${id}`);
      if (!res.ok) throw new Error("Failed to fetch chat");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch("/api/agent-chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      return res.json() as Promise<AgentChat>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-chats"] });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/agent-chats/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete chat");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-chats"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      role,
      content,
    }: {
      chatId: string;
      role: string;
      content: string;
    }) => {
      const res = await fetch(`/api/agent-chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json() as Promise<AgentMessage>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["agent-chat", variables.chatId],
      });
      queryClient.invalidateQueries({ queryKey: ["agent-chats"] });
    },
  });
}
