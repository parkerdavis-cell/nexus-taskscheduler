"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Target,
  Trash2,
  Bot,
  User,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TaskActivityFeed } from "./task-activity-feed";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useGoals } from "@/hooks/use-goals";
import { useSchedules } from "@/hooks/use-schedules";
import { useUserName } from "@/hooks/use-user-profile";
import { formatDate, isOverdue } from "@/lib/date-utils";
import { PRIORITY_COLORS } from "@/types";
import type { TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export function TaskDetail({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: workspaces } = useWorkspaces();
  const { data: goals } = useGoals(task?.workspaceId);
  const { data: schedules } = useSchedules();
  const { data: profile } = useUserName();
  const userName = profile?.name ?? "User";

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingBrief, setEditingBrief] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [agentBrief, setAgentBrief] = useState("");

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (!task) {
    return <div className="py-12 text-center text-muted-foreground">Task not found</div>;
  }

  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  const handleUpdate = (data: Record<string, unknown>) => {
    updateTask.mutate(
      { id: task.id, ...data },
      { onError: () => toast.error("Failed to update") }
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success("Task deleted");
        router.push("/tasks");
      },
    });
  };

  return (
    <div className="flex h-full gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>
        </div>

        {/* Title */}
        {editingTitle ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim() && title !== task.title) {
                handleUpdate({ title: title.trim() });
              }
              setEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="mb-2 text-xl font-bold"
          />
        ) : (
          <h1
            className={cn(
              "mb-2 text-xl font-bold cursor-pointer hover:text-primary transition-colors",
              task.status === "DONE" && "line-through opacity-60"
            )}
            onClick={() => {
              setTitle(task.title);
              setEditingTitle(true);
            }}
          >
            {task.title}
          </h1>
        )}

        {/* Description */}
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
          {editingDesc ? (
            <Textarea
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== (task.description || "")) {
                  handleUpdate({ description: description || null });
                }
                setEditingDesc(false);
              }}
              rows={4}
              className="resize-none"
            />
          ) : (
            <div
              className="min-h-[60px] rounded-md border border-transparent p-2 text-sm text-foreground/80 cursor-pointer hover:border-border transition-colors whitespace-pre-wrap"
              onClick={() => {
                setDescription(task.description || "");
                setEditingDesc(true);
              }}
            >
              {task.description || (
                <span className="text-muted-foreground italic">
                  Click to add description...
                </span>
              )}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Activity feed */}
        <TaskActivityFeed taskId={task.id} />
      </div>

      {/* Right sidebar */}
      <div className="w-72 shrink-0 space-y-4">
        {/* Status */}
        <div>
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={task.status}
            onValueChange={(v) => handleUpdate({ status: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <Select
            value={task.priority}
            onValueChange={(v) => handleUpdate({ priority: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["URGENT", "HIGH", "MEDIUM", "LOW", "BACKLOG"] as const).map((p) => (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PRIORITY_COLORS[p] }}
                    />
                    {p}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workspace */}
        <div>
          <Label className="text-xs text-muted-foreground">Workspace</Label>
          <Select
            value={task.workspaceId}
            onValueChange={(v) => handleUpdate({ workspaceId: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaces?.map((ws) => (
                <SelectItem key={ws.id} value={ws.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: ws.color }}
                    />
                    {ws.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div>
          <Label className="text-xs text-muted-foreground">Due Date</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
              onChange={(e) =>
                handleUpdate({ dueDate: e.target.value || null })
              }
            />
            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-xs",
                  overdue && "border-destructive text-destructive"
                )}
              >
                <Clock className="mr-1 h-3 w-3" />
                {formatDate(task.dueDate)}
              </Badge>
            )}
          </div>
        </div>

        {/* Estimated time */}
        <div>
          <Label className="text-xs text-muted-foreground">Estimated Time</Label>
          <Input
            type="number"
            min="1"
            className="mt-1"
            value={task.estimatedMins || ""}
            onChange={(e) =>
              handleUpdate({
                estimatedMins: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="Minutes"
          />
        </div>

        {/* Goal link */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="h-3 w-3" /> Goal
          </Label>
          <Select
            value={task.goalId || "none"}
            onValueChange={(v) =>
              handleUpdate({ goalId: v === "none" ? null : v })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {goals?.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            {task.assignee === "agent" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
            Assignee
          </Label>
          <Select
            value={task.assignee || "user"}
            onValueChange={(v) => handleUpdate({ assignee: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{userName}</SelectItem>
              <SelectItem value="agent">Claude</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> Schedule
          </Label>
          <Select
            value={task.scheduleId || "any"}
            onValueChange={(v) => handleUpdate({ scheduleId: v === "any" ? null : v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              {schedules?.map((s: { id: string; name: string; color: string }) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scheduling options */}
        <div className="space-y-3">
          {task.estimatedMins && (
            <div>
              <Label className="text-xs text-muted-foreground">Min Chunk (mins)</Label>
              <Input
                type="number"
                min="15"
                step="15"
                className="mt-1"
                value={task.minChunkMins || ""}
                onChange={(e) =>
                  handleUpdate({ minChunkMins: e.target.value ? parseInt(e.target.value) : null })
                }
                placeholder="e.g. 25"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={task.autoSchedule ?? true}
                onChange={(e) => handleUpdate({ autoSchedule: e.target.checked })}
                className="rounded"
              />
              Auto-schedule
            </label>
            {task.dueDate && (
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={task.isHardDeadline ?? false}
                  onChange={(e) => handleUpdate({ isHardDeadline: e.target.checked })}
                  className="rounded"
                />
                Hard deadline
              </label>
            )}
          </div>
        </div>

        {/* Time Blocks */}
        {task.timeBlocks && task.timeBlocks.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground">Time Blocks</Label>
            <div className="mt-1 space-y-1">
              {task.timeBlocks.map((tb: { id: string; date: string; startTime: string; endTime: string; chunkIndex: number | null; chunkTotal: number | null; isAutoScheduled: boolean }) => (
                <div key={tb.id} className="flex items-center gap-2 text-xs text-muted-foreground rounded bg-muted/30 px-2 py-1">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  <span>{new Date(tb.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span>{tb.startTime}-{tb.endTime}</span>
                  {tb.chunkIndex !== null && tb.chunkTotal !== null && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {tb.chunkIndex + 1}/{tb.chunkTotal}
                    </Badge>
                  )}
                  {tb.isAutoScheduled && <Bot className="h-3 w-3 ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Agent Brief */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Bot className="h-3 w-3" /> Agent Brief
          </Label>
          {editingBrief ? (
            <Textarea
              autoFocus
              value={agentBrief}
              onChange={(e) => setAgentBrief(e.target.value)}
              onBlur={() => {
                if (agentBrief !== (task.agentBrief || "")) {
                  handleUpdate({ agentBrief: agentBrief || null });
                }
                setEditingBrief(false);
              }}
              rows={3}
              className="mt-1 resize-none text-xs"
              placeholder="Instructions for Claude..."
            />
          ) : (
            <div
              className="mt-1 min-h-[40px] cursor-pointer rounded-md border border-transparent p-2 text-xs text-muted-foreground hover:border-border transition-colors whitespace-pre-wrap"
              onClick={() => {
                setAgentBrief(task.agentBrief || "");
                setEditingBrief(true);
              }}
            >
              {task.agentBrief || "Click to add agent instructions..."}
            </div>
          )}
        </div>

        <Separator />

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Created by: {task.createdBy}</p>
          <p>Created: {formatDate(task.createdAt)}</p>
          {task.completedAt && <p>Completed: {formatDate(task.completedAt)}</p>}
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Task
        </Button>
      </div>
    </div>
  );
}
