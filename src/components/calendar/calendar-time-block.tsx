"use client";

import { minutesToTop, minutesToHeight, timeToMinutes, formatTimeDisplay } from "./calendar-constants";
import { PRIORITY_COLORS } from "@/types";
import type { TaskPriority } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bot, User, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

export interface TimeBlockData {
  id: string;
  startTime: string;
  endTime: string;
  title: string | null;
  description: string | null;
  color: string | null;
  status: string;
  isAutoScheduled: boolean;
  chunkIndex: number | null;
  chunkTotal: number | null;
  task: {
    id: string;
    title: string;
    priority: string;
    status: string;
    workspaceId: string;
    assignee?: string;
    workspace?: { color: string };
  } | null;
}

interface Props {
  block: TimeBlockData;
  onDelete?: (id: string) => void;
}

export function CalendarTimeBlock({ block, onDelete }: Props) {
  const start = timeToMinutes(block.startTime);
  const end = timeToMinutes(block.endTime);
  const top = minutesToTop(start);
  const height = minutesToHeight(end - start);

  const bgColor = block.color
    || block.task?.workspace?.color
    || (block.task?.priority ? PRIORITY_COLORS[block.task.priority as TaskPriority] : null)
    || "#6b7280";

  const title = block.title || block.task?.title || "Untitled";
  const chunkLabel = block.chunkIndex !== null && block.chunkTotal !== null
    ? ` (${block.chunkIndex + 1}/${block.chunkTotal})`
    : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden border border-white/10 transition-opacity hover:opacity-90"
          style={{
            top,
            height: Math.max(height, 20),
            backgroundColor: bgColor + "20",
            borderLeft: `3px solid ${bgColor}`,
          }}
        >
          <div className="text-xs font-medium truncate" style={{ color: bgColor }}>
            {title}{chunkLabel}
          </div>
          {height > 30 && (
            <div className="text-[10px] text-muted-foreground">
              {formatTimeDisplay(block.startTime)} - {formatTimeDisplay(block.endTime)}
            </div>
          )}
          {height > 45 && block.isAutoScheduled && (
            <div className="flex items-center gap-1 mt-0.5">
              <Bot className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Auto</span>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64" side="right" align="start">
        <div className="space-y-2">
          <div className="font-medium">{title}{chunkLabel}</div>
          <div className="text-sm text-muted-foreground">
            {formatTimeDisplay(block.startTime)} - {formatTimeDisplay(block.endTime)}
          </div>
          {block.description && (
            <p className="text-sm text-muted-foreground">{block.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {block.isAutoScheduled ? (
              <><Bot className="h-3 w-3" /> Auto-scheduled</>
            ) : (
              <><User className="h-3 w-3" /> Manual</>
            )}
            <span className="capitalize">| {block.status.toLowerCase()}</span>
          </div>
          <div className="flex gap-2 pt-2">
            {block.task && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/tasks/${block.task.id}`}>
                  <ExternalLink className="h-3 w-3 mr-1" /> Open Task
                </Link>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onDelete(block.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
