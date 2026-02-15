"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { useUpdateGoal, type GoalWithRelations } from "@/hooks/use-goals";
import { toast } from "sonner";

export function GoalEditDialog({ goal }: { goal: GoalWithRelations }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [targetDate, setTargetDate] = useState(
    goal.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : ""
  );
  const [progressType, setProgressType] = useState(goal.progressType);
  const [targetValue, setTargetValue] = useState(String(goal.targetValue));
  const [priority, setPriority] = useState(goal.priority);

  const updateGoal = useUpdateGoal();

  // Sync state when goal changes
  useEffect(() => {
    if (open) {
      setTitle(goal.title);
      setDescription(goal.description || "");
      setTargetDate(
        goal.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : ""
      );
      setProgressType(goal.progressType);
      setTargetValue(String(goal.targetValue));
      setPriority(goal.priority);
    }
  }, [open, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateGoal.mutate(
      {
        id: goal.id,
        title: title.trim(),
        description: description || null,
        targetDate: targetDate || null,
        progressType: progressType as "TASK_COUNT" | "PERCENTAGE" | "CUSTOM",
        targetValue: parseInt(targetValue) || 100,
        priority: priority as "HIGH" | "MEDIUM" | "LOW",
      },
      {
        onSuccess: () => {
          toast.success("Goal updated");
          setOpen(false);
        },
        onError: () => toast.error("Failed to update goal"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="editTitle">Title</Label>
            <Input
              id="editTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="editDesc">Description</Label>
            <Textarea
              id="editDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editTarget">Target Date</Label>
              <Input
                id="editTarget"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Progress Type</Label>
              <Select value={progressType} onValueChange={setProgressType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK_COUNT">Task Count</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="CUSTOM">Custom Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {progressType !== "TASK_COUNT" && (
              <div>
                <Label htmlFor="editTargetVal">Target Value</Label>
                <Input
                  id="editTargetVal"
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateGoal.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
