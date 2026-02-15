"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from "@/hooks/use-tasks";
import { useCreateTimeBlock } from "@/hooks/use-time-blocks";
import { minutesToTime, localDateStr } from "./calendar-constants";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  startMinutes: number;
}

export function CalendarCreateDialog({ open, onOpenChange, date, startMinutes }: Props) {
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState<string>("none");
  const [duration, setDuration] = useState(60);

  const { data: tasks } = useTasks({ status: "TODO" });
  const createBlock = useCreateTimeBlock();

  const dateStr = localDateStr(date);
  const startTime = minutesToTime(startMinutes);
  const endTime = minutesToTime(startMinutes + duration);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createBlock.mutate(
      {
        date: dateStr,
        startTime,
        endTime,
        title: taskId === "none" ? title : undefined,
        taskId: taskId !== "none" ? taskId : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Time block created");
          onOpenChange(false);
          setTitle("");
          setTaskId("none");
          setDuration(60);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Time Block</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            {" at "}{startTime}
          </div>

          <div className="space-y-2">
            <Label>Link to Task</Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="No task (standalone block)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No task (standalone block)</SelectItem>
                {tasks?.map((t: { id: string; title: string }) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {taskId === "none" && (
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Block title"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90, 120, 180].map((d) => (
                  <SelectItem key={d} value={d.toString()}>
                    {d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}m` : ""}` : `${d}m`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={createBlock.isPending}>
            {createBlock.isPending ? "Creating..." : "Create Block"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
