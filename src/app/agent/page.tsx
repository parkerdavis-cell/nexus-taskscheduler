"use client";

import { useState } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/agent/chat-sidebar";
import { ChatMessages } from "@/components/agent/chat-messages";
import { ChatInput } from "@/components/agent/chat-input";
import { TerminalPanel } from "@/components/agent/terminal-panel";
import { useAgentChat, useSendMessage } from "@/hooks/use-agent-chats";

export default function AgentPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const { data: chat } = useAgentChat(activeChatId);
  const sendMessage = useSendMessage();

  const handleSend = (content: string) => {
    if (!activeChatId) return;
    sendMessage.mutate({ chatId: activeChatId, role: "user", content });
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar activeChatId={activeChatId} onSelectChat={setActiveChatId} />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <h2 className="text-sm font-semibold">
            {chat?.title || "Select a chat"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setTerminalOpen((o) => !o)}
          >
            <TerminalIcon className="h-3.5 w-3.5" />
            Terminal
          </Button>
        </div>

        {/* Messages area */}
        {activeChatId ? (
          <ChatMessages messages={chat?.messages || []} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p className="text-sm">Select or create a chat to get started</p>
          </div>
        )}

        {/* Terminal — each chat gets its own session */}
        {activeChatId && (
          <TerminalPanel
            isOpen={terminalOpen}
            onClose={() => setTerminalOpen(false)}
            sessionId={activeChatId}
          />
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          disabled={!activeChatId || sendMessage.isPending}
        />
      </div>
    </div>
  );
}
