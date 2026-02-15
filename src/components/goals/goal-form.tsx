"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useCreateGoal } from "@/hooks/use-goals";
import { toast } from "sonner";

export function GoalFormDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [progressType, setProgressType] = useState("TASK_COUNT");
  const [targetValue, setTargetValue] = useState("100");
  const [priority, setPriority] = useState("MEDIUM");

  const { data: workspaces } = useWorkspaces();
  const createGoal = useCreateGoal();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setWorkspaceId("");
    setTargetDate("");
    setProgressType("TASK_COUNT");
    setTargetValue("100");
    setPriority("MEDIUM");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    createGoal.mutate(
      {
        title: title.trim(),
        description: description || undefined,
        workspaceId,
        targetDate: targetDate || undefined,
        progressType: progressType as "TASK_COUNT" | "PERCENTAGE" | "CUSTOM",
        targetValue: parseInt(targetValue) || 100,
        priority: priority as "HIGH" | "MEDIUM" | "LOW",
      },
      {
        onSuccess: () => {
          toast.success("Goal created");
          resetForm();
          setOpen(false);
        },
        onError: () => toast.error("Failed to create goal"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goalTitle">Title</Label>
            <Input
              id="goalTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="goalDesc">Description</Label>
            <Textarea
              id="goalDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Success criteria, context..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Workspace</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select space" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goalTarget">Target Date</Label>
              <Input
                id="goalTarget"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
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
          </div>

          {progressType !== "TASK_COUNT" && (
            <div>
              <Label htmlFor="goalTargetVal">Target Value</Label>
              <Input
                id="goalTargetVal"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoal.isPending}>
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
