"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, ChevronUp, ChevronDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  useCreateMilestone,
  useToggleMilestone,
  useDeleteMilestone,
  useUpdateMilestone,
  type MilestoneWithKeyResult,
} from "@/hooks/use-goals";
import { formatShortDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MilestoneList({
  goalId,
  milestones,
}: {
  goalId: string;
  milestones: MilestoneWithKeyResult[];
}) {
  const [adding, setAdding] = useState(false);
  const [isKeyResult, setIsKeyResult] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const createMilestone = useCreateMilestone();
  const toggleMilestone = useToggleMilestone();
  const deleteMilestone = useDeleteMilestone();
  const updateMilestone = useUpdateMilestone();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMilestone.mutate(
      {
        goalId,
        title: title.trim(),
        targetDate: targetDate || undefined,
        targetValue: isKeyResult && targetValue ? parseInt(targetValue) : undefined,
        unit: isKeyResult && unit ? unit : undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setTargetDate("");
          setTargetValue("");
          setUnit("");
          setAdding(false);
          setIsKeyResult(false);
        },
      }
    );
  };

  const handleDelete = (milestoneId: string) => {
    deleteMilestone.mutate(
      { goalId, milestoneId },
      { onSuccess: () => toast.success("Milestone deleted") }
    );
  };

  const handleEditSave = (milestoneId: string) => {
    if (editTitle.trim() && editTitle !== milestones.find((m) => m.id === milestoneId)?.title) {
      updateMilestone.mutate({
        goalId,
        milestoneId,
        title: editTitle.trim(),
      });
    }
    setEditingId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const ms = milestones[index];
    const prev = milestones[index - 1];
    updateMilestone.mutate({ goalId, milestoneId: ms.id, sortOrder: prev.sortOrder });
    updateMilestone.mutate({ goalId, milestoneId: prev.id, sortOrder: ms.sortOrder });
  };

  const handleMoveDown = (index: number) => {
    if (index >= milestones.length - 1) return;
    const ms = milestones[index];
    const next = milestones[index + 1];
    updateMilestone.mutate({ goalId, milestoneId: ms.id, sortOrder: next.sortOrder });
    updateMilestone.mutate({ goalId, milestoneId: next.id, sortOrder: ms.sortOrder });
  };

  const handleKeyResultUpdate = (milestoneId: string, newValue: number, tv: number) => {
    updateMilestone.mutate({
      goalId,
      milestoneId,
      currentValue: newValue,
      isCompleted: newValue >= tv,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Milestones</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdding(!adding)}
          className="h-7 text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-md border border-border p-2">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Milestone title..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setAdding(false);
                setIsKeyResult(false);
              }
            }}
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <Button
              type="button"
              variant={isKeyResult ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => setIsKeyResult(!isKeyResult)}
            >
              <BarChart3 className="h-3 w-3" />
              Key Result
            </Button>
          </div>
          {isKeyResult && (
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Target (e.g. 50)"
                className="h-8 text-sm flex-1"
              />
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit (e.g. users)"
                className="h-8 text-sm flex-1"
              />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => { setAdding(false); setIsKeyResult(false); }}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-7" disabled={createMilestone.isPending}>
              Add
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-1">
        {milestones.map((ms, index) => (
          <div
            key={ms.id}
            className={cn(
              "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50",
              ms.isCompleted && "opacity-60"
            )}
          >
            {/* Key Result with progress bar */}
            {ms.targetValue != null ? (
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  {editingId === ms.id ? (
                    <Input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSave(ms.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-6 text-sm py-0 px-1"
                    />
                  ) : (
                    <span
                      className={cn(
                        "cursor-pointer hover:text-primary",
                        ms.isCompleted && "line-through"
                      )}
                      onClick={() => {
                        setEditTitle(ms.title);
                        setEditingId(ms.id);
                      }}
                    >
                      {ms.title}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max={ms.targetValue}
                      value={ms.currentValue}
                      onChange={(e) => handleKeyResultUpdate(ms.id, parseInt(e.target.value) || 0, ms.targetValue!)}
                      className="h-6 w-16 text-xs text-right py-0"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      / {ms.targetValue} {ms.unit || ""}
                    </span>
                  </div>
                </div>
                <Progress
                  value={ms.targetValue > 0 ? Math.min(100, Math.round((ms.currentValue / ms.targetValue) * 100)) : 0}
                  className="h-1.5"
                />
                {ms.targetDate && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatShortDate(ms.targetDate)}
                  </span>
                )}
              </div>
            ) : (
              /* Standard checkbox milestone */
              <>
                <button
                  onClick={() =>
                    toggleMilestone.mutate({
                      goalId,
                      milestoneId: ms.id,
                      isCompleted: !ms.isCompleted,
                    })
                  }
                  className="shrink-0"
                >
                  {ms.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {editingId === ms.id ? (
                  <Input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleEditSave(ms.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-6 flex-1 text-sm py-0 px-1"
                  />
                ) : (
                  <span
                    className={cn(
                      "flex-1 cursor-pointer hover:text-primary",
                      ms.isCompleted && "line-through"
                    )}
                    onClick={() => {
                      setEditTitle(ms.title);
                      setEditingId(ms.id);
                    }}
                  >
                    {ms.title}
                  </span>
                )}
                {ms.targetDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatShortDate(ms.targetDate)}
                  </span>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {milestones.length > 1 && (
                <>
                  <button onClick={() => handleMoveUp(index)} className="p-0.5 hover:text-primary" disabled={index === 0}>
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleMoveDown(index)} className="p-0.5 hover:text-primary" disabled={index === milestones.length - 1}>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(ms.id)} className="p-0.5 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {milestones.length === 0 && !adding && (
          <p className="py-2 text-center text-xs text-muted-foreground">
            No milestones yet
          </p>
        )}
      </div>
    </div>
  );
}
