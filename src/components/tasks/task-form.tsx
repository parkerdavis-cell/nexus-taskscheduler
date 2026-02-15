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
import { useGoals } from "@/hooks/use-goals";
import { useSchedules } from "@/hooks/use-schedules";
import { useCreateTask } from "@/hooks/use-tasks";
import { useUserName } from "@/hooks/use-user-profile";
import { toast } from "sonner";

interface TaskFormProps {
  defaultWorkspace?: string;
}

export function TaskFormDialog({ defaultWorkspace }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [workspaceId, setWorkspaceId] = useState(defaultWorkspace || "");
  const [goalId, setGoalId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMins, setEstimatedMins] = useState("");
  const [agentBrief, setAgentBrief] = useState("");
  const [assignee, setAssignee] = useState("user");
  const [scheduleId, setScheduleId] = useState("");
  const [minChunkMins, setMinChunkMins] = useState("");
  const [isHardDeadline, setIsHardDeadline] = useState(false);

  const { data: workspaces } = useWorkspaces();
  const { data: goals } = useGoals(workspaceId || undefined);
  const { data: schedules } = useSchedules();
  const createTask = useCreateTask();
  const { data: profile } = useUserName();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setWorkspaceId(defaultWorkspace || "");
    setGoalId("");
    setDueDate("");
    setEstimatedMins("");
    setAgentBrief("");
    setAssignee("user");
    setScheduleId("");
    setMinChunkMins("");
    setIsHardDeadline(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    createTask.mutate(
      {
        title: title.trim(),
        description: description || undefined,
        priority: priority as "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "BACKLOG",
        workspaceId,
        goalId: goalId || undefined,
        dueDate: dueDate || undefined,
        estimatedMins: estimatedMins ? parseInt(estimatedMins) : undefined,
        agentBrief: agentBrief || undefined,
        assignee: assignee as "user" | "agent",
        scheduleId: scheduleId || undefined,
        minChunkMins: minChunkMins ? parseInt(minChunkMins) : undefined,
        isHardDeadline: dueDate ? isHardDeadline : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Task created");
          resetForm();
          setOpen(false);
        },
        onError: () => toast.error("Failed to create task"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details, context, acceptance criteria..."
              rows={3}
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
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="estimatedMins">Estimated (minutes)</Label>
              <Input
                id="estimatedMins"
                type="number"
                min="1"
                value={estimatedMins}
                onChange={(e) => setEstimatedMins(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          {workspaceId && goals && goals.length > 0 && (
            <div>
              <Label>Link to Goal</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{profile?.name ?? "User"}</SelectItem>
                  <SelectItem value="agent">Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule</Label>
              <Select value={scheduleId || "any"} onValueChange={(v) => setScheduleId(v === "any" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
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
          </div>

          {estimatedMins && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minChunkMins">Min Chunk (mins)</Label>
                <Input
                  id="minChunkMins"
                  type="number"
                  min="15"
                  step="15"
                  value={minChunkMins}
                  onChange={(e) => setMinChunkMins(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>
              {dueDate && (
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHardDeadline}
                      onChange={(e) => setIsHardDeadline(e.target.checked)}
                      className="rounded"
                    />
                    Hard deadline
                  </label>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="agentBrief">Agent Brief</Label>
            <Textarea
              id="agentBrief"
              value={agentBrief}
              onChange={(e) => setAgentBrief(e.target.value)}
              placeholder="Instructions for Claude when working on this task..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
