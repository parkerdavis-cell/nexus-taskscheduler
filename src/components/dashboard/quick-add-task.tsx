"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useCreateTask } from "@/hooks/use-tasks";
import { toast } from "sonner";

export function QuickAddTask() {
  const [title, setTitle] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [open, setOpen] = useState(false);
  const { data: workspaces } = useWorkspaces();
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    createTask.mutate(
      { title: title.trim(), workspaceId },
      {
        onSuccess: () => {
          setTitle("");
          setOpen(false);
          toast.success("Task created");
        },
        onError: () => {
          toast.error("Failed to create task");
        },
      }
    );
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Quick Add
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        autoFocus
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 w-48"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <Select value={workspaceId} onValueChange={setWorkspaceId}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue placeholder="Space" />
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
      <Button type="submit" size="sm" className="h-8" disabled={createTask.isPending}>
        Add
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>
    </form>
  );
}
