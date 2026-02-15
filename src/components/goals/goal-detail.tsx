"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MilestoneList } from "./milestone-list";
import { GoalEditDialog } from "./goal-edit-dialog";
import { CheckInList } from "./check-in-list";
import { PacingIndicator } from "./pacing-indicator";
import { TaskCard } from "@/components/tasks/task-card";
import { useGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/use-goals";
import { formatDate, daysUntil } from "@/lib/date-utils";
import { GOAL_STATUS_LABELS, GOAL_PRIORITY_COLORS } from "@/types";
import type { GoalStatus, GoalPriority } from "@/types";
import { toast } from "sonner";

export function GoalDetail({ goalId }: { goalId: string }) {
  const router = useRouter();
  const { data: goal, isLoading } = useGoal(goalId);
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  // Inline title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (!goal) {
    return <div className="py-12 text-center text-muted-foreground">Goal not found</div>;
  }

  // Progress computation based on progressType
  const total = goal.totalTaskCount ?? goal._count.tasks;
  const completed = goal.completedTaskCount ?? 0;

  let progress: number;
  if (goal.progressType === "TASK_COUNT") {
    progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  } else if (goal.progressType === "PERCENTAGE") {
    progress = Math.min(100, goal.currentValue);
  } else {
    progress = goal.targetValue > 0
      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
      : 0;
  }

  // Deadline pressure
  const daysLeft = goal.targetDate ? daysUntil(goal.targetDate) : null;
  let deadlineColor = "text-muted-foreground";
  if (daysLeft !== null) {
    if (daysLeft < 0) deadlineColor = "text-red-500";
    else if (daysLeft <= 3) deadlineColor = "text-red-500";
    else if (daysLeft <= 7) deadlineColor = "text-orange-500";
    else if (daysLeft <= 14) deadlineColor = "text-yellow-500";
    else deadlineColor = "text-green-500";
  }

  // Time invested formatting
  const timeInvested = goal.timeInvestedMins ?? 0;
  const hoursInvested = Math.floor(timeInvested / 60);
  const minsInvested = timeInvested % 60;

  const handleDelete = () => {
    deleteGoal.mutate(goal.id, {
      onSuccess: () => {
        toast.success("Goal deleted");
        router.push("/goals");
      },
    });
  };

  const handleTitleSave = () => {
    if (titleDraft.trim() && titleDraft !== goal.title) {
      updateGoal.mutate({ id: goal.id, title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const tasks = (goal as unknown as { tasks?: Array<Record<string, unknown>> }).tasks || [];

  return (
    <div className="space-y-6">
      <Link
        href="/goals"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to goals
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: goal.workspace.color }}
            />
            {editingTitle ? (
              <Input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                className="text-2xl font-bold h-auto py-0 px-1"
              />
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setTitleDraft(goal.title);
                  setEditingTitle(true);
                }}
              >
                {goal.title}
              </h1>
            )}
          </div>
          {goal.description && (
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl ml-6">
              {goal.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ color: GOAL_PRIORITY_COLORS[goal.priority as GoalPriority] }}
          >
            {goal.priority}
          </Badge>
          <Select
            value={goal.status}
            onValueChange={(v) => updateGoal.mutate({ id: goal.id, status: v as GoalStatus })}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GOAL_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <GoalEditDialog goal={goal} />
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <div className="flex items-center gap-2">
            <PacingIndicator
              targetDate={goal.targetDate}
              createdAt={goal.createdAt}
              currentProgress={progress}
            />
            <span className="text-sm font-bold">{progress}%</span>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {goal.progressType === "TASK_COUNT" ? (
              <span>{completed} of {total} tasks completed</span>
            ) : goal.progressType === "PERCENTAGE" ? (
              <span>{goal.currentValue}% complete</span>
            ) : (
              <span>{goal.currentValue} / {goal.targetValue}</span>
            )}
            {timeInvested > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {hoursInvested}h {minsInvested}m invested
              </span>
            )}
          </div>
          {goal.targetDate && (
            <span className={`flex items-center gap-1 ${deadlineColor}`}>
              <Calendar className="h-3 w-3" />
              {daysLeft !== null && daysLeft < 0
                ? `Overdue by ${Math.abs(daysLeft)} days`
                : daysLeft === 0
                  ? "Due today"
                  : `${daysLeft} days left`}
              {" \u00B7 "}
              {formatDate(goal.targetDate)}
            </span>
          )}
        </div>
      </div>

      {/* Check-ins for manual progress types */}
      {goal.progressType !== "TASK_COUNT" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <CheckInList
            goalId={goal.id}
            targetValue={goal.targetValue}
            currentValue={goal.currentValue}
            progressType={goal.progressType}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones */}
        <div className="rounded-lg border border-border bg-card p-4">
          <MilestoneList goalId={goal.id} milestones={goal.milestones} />
        </div>

        {/* Linked Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold">Linked Tasks ({total})</h3>
          {tasks.length > 0 ? (
            <div className="space-y-1.5">
              {tasks.map((task: Record<string, unknown>) => (
                <TaskCard key={task.id as string} task={task as never} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No tasks linked to this goal yet. Link tasks from the task detail page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
