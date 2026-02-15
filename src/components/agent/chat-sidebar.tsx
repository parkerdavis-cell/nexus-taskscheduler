"use client";

import { Plus, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentChats, useCreateChat, useDeleteChat } from "@/hooks/use-agent-chats";

interface ChatSidebarProps {
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}

export function ChatSidebar({ activeChatId, onSelectChat }: ChatSidebarProps) {
  const { data: chats } = useAgentChats();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();

  const handleNewChat = async () => {
    const chat = await createChat.mutateAsync(undefined);
    onSelectChat(chat.id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChat.mutate(id);
    if (activeChatId === id) {
      const remaining = chats?.filter((c) => c.id !== id);
      onSelectChat(remaining?.[0]?.id || "");
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-muted/30">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-semibold">Chats</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleNewChat}
          disabled={createChat.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {chats?.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectChat(chat.id)}
              onKeyDown={(e) => e.key === "Enter" && onSelectChat(chat.id)}
              className={cn(
                "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                activeChatId === chat.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{chat.title}</span>
              <button
                onClick={(e) => handleDelete(e, chat.id)}
                className="hidden shrink-0 rounded p-0.5 hover:bg-destructive/20 group-hover:block"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}

          {(!chats || chats.length === 0) && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No chats yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
