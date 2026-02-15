"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bot, User, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskActivities, useCreateActivity } from "@/hooks/use-tasks";
import { useUserName } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";

const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:!?"')}\]])/g;

function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function TaskActivityFeed({ taskId }: { taskId: string }) {
  const { data: activities, isLoading } = useTaskActivities(taskId);
  const createActivity = useCreateActivity();
  const { data: profile } = useUserName();
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createActivity.mutate(
      { taskId, content: content.trim(), type: "COMMENT", author: "user" },
      {
        onSuccess: () => setContent(""),
      }
    );
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="mb-3 text-sm font-semibold">Activity</h3>

      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-3">
          {activities?.map((activity: {
            id: string;
            type: string;
            content: string;
            author: string;
            createdAt: string;
          }) => {
            const isAgent = activity.author === "agent";
            const isSystem = activity.type === "SYSTEM" || activity.type === "STATUS_CHANGE" || activity.type === "ASSIGNMENT";

            // System messages: centered
            if (isSystem) {
              return (
                <div key={activity.id} className="flex justify-center py-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activity.type === "ASSIGNMENT" ? (
                      <UserCheck className="h-3 w-3" />
                    ) : (
                      <span className="h-px w-4 bg-border" />
                    )}
                    <span>{activity.content}</span>
                    <span className="text-[10px]">
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </span>
                    <span className="h-px w-4 bg-border" />
                  </div>
                </div>
              );
            }

            // Chat-style layout: agent left, user right
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex gap-2 max-w-[85%]",
                  isAgent ? "mr-auto" : "ml-auto flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    isAgent ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  {isAgent ? (
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className={cn(
                    "flex items-center gap-2 mb-0.5",
                    !isAgent && "flex-row-reverse"
                  )}>
                    <span className="text-xs font-medium">
                      {isAgent ? "Agent" : (profile?.name ?? "User")}
                    </span>
                    {activity.type !== "COMMENT" && activity.type !== "NOTE" && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {activity.type.replace("_", " ")}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words overflow-hidden",
                      isAgent
                        ? "bg-primary/10 rounded-tl-none"
                        : "bg-muted rounded-tr-none"
                    )}
                  >
                    <Linkify text={activity.content} />
                  </div>
                </div>
              </div>
            );
          })}

          {(!activities || activities.length === 0) && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No activity yet
            </p>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 self-end"
          disabled={!content.trim() || createActivity.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
