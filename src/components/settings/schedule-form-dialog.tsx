"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateSchedule,
  useUpdateSchedule,
} from "@/hooks/use-schedules";
import { COLOR_OPTIONS } from "./workspace-form-dialog";
import { toast } from "sonner";

interface TimeWindow {
  startTime: string;
  endTime: string;
}

interface DayWindows {
  enabled: boolean;
  windows: TimeWindow[];
}

// Display order: Mon(1) - Sun(0)
const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0] as const;
const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const DEFAULT_WINDOW: TimeWindow = { startTime: "09:00", endTime: "17:00" };

function emptyGrid(): DayWindows[] {
  return Array.from({ length: 7 }, () => ({ enabled: false, windows: [{ ...DEFAULT_WINDOW }] }));
}

function gridFromFlat(flat: { dayOfWeek: number; startTime: string; endTime: string }[]): DayWindows[] {
  const grid = emptyGrid();
  for (const w of flat) {
    grid[w.dayOfWeek].enabled = true;
    // Replace the default window on first encounter, append on subsequent
    if (grid[w.dayOfWeek].windows.length === 1 && grid[w.dayOfWeek].windows[0].startTime === DEFAULT_WINDOW.startTime && grid[w.dayOfWeek].windows[0].endTime === DEFAULT_WINDOW.endTime) {
      grid[w.dayOfWeek].windows = [{ startTime: w.startTime, endTime: w.endTime }];
    } else {
      grid[w.dayOfWeek].windows.push({ startTime: w.startTime, endTime: w.endTime });
    }
  }
  return grid;
}

function gridToFlat(grid: DayWindows[]): { dayOfWeek: number; startTime: string; endTime: string }[] {
  const result: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  for (let day = 0; day < 7; day++) {
    if (grid[day].enabled) {
      for (const w of grid[day].windows) {
        result.push({ dayOfWeek: day, startTime: w.startTime, endTime: w.endTime });
      }
    }
  }
  return result;
}

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: {
    id: string;
    name: string;
    color: string;
    isDefault: boolean;
    windows: { dayOfWeek: number; startTime: string; endTime: string }[];
  };
}

export function ScheduleFormDialog({ open, onOpenChange, schedule }: ScheduleFormDialogProps) {
  const isEdit = !!schedule;
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [isDefault, setIsDefault] = useState(false);
  const [grid, setGrid] = useState<DayWindows[]>(emptyGrid);

  useEffect(() => {
    if (open) {
      if (schedule) {
        setName(schedule.name);
        setColor(schedule.color);
        setIsDefault(schedule.isDefault);
        setGrid(gridFromFlat(schedule.windows));
      } else {
        setName("");
        setColor(COLOR_OPTIONS[0]);
        setIsDefault(false);
        setGrid(emptyGrid());
      }
    }
  }, [open, schedule]);

  const updateDay = (dayIndex: number, patch: Partial<DayWindows>) => {
    setGrid((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, ...patch } : d)));
  };

  const updateWindow = (dayIndex: number, winIndex: number, patch: Partial<TimeWindow>) => {
    setGrid((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, windows: d.windows.map((w, j) => (j === winIndex ? { ...w, ...patch } : w)) }
          : d
      )
    );
  };

  const addWindow = (dayIndex: number) => {
    setGrid((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, windows: [...d.windows, { ...DEFAULT_WINDOW }] } : d
      )
    );
  };

  const removeWindow = (dayIndex: number, winIndex: number) => {
    setGrid((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, windows: d.windows.filter((_, j) => j !== winIndex) } : d
      )
    );
  };

  const firstEnabledDay = grid.find((d) => d.enabled);

  const copyToWeekdays = () => {
    if (!firstEnabledDay) return;
    const windows = firstEnabledDay.windows.map((w) => ({ ...w }));
    setGrid((prev) =>
      prev.map((d, i) => (i >= 1 && i <= 5 ? { ...d, enabled: true, windows: windows.map((w) => ({ ...w })) } : d))
    );
  };

  const copyToAll = () => {
    if (!firstEnabledDay) return;
    const windows = firstEnabledDay.windows.map((w) => ({ ...w }));
    setGrid((prev) =>
      prev.map((d) => ({ ...d, enabled: true, windows: windows.map((w) => ({ ...w })) }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const windows = gridToFlat(grid);
    const payload = { name: name.trim(), color, isDefault, windows };

    if (isEdit) {
      updateSchedule.mutate(
        { id: schedule.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Schedule updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update schedule"),
        }
      );
    } else {
      createSchedule.mutate(payload, {
        onSuccess: () => {
          toast.success("Schedule created");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create schedule"),
      });
    }
  };

  const isPending = createSchedule.isPending || updateSchedule.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Schedule" : "New Schedule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="schedName">Name</Label>
            <Input
              id="schedName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Deep Work"
              autoFocus
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="mt-1 flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-8 w-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid white" : "none",
                    outlineOffset: "2px",
                    transform: color === c ? "scale(1.1)" : "scale(1)",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="schedDefault">Default schedule</Label>
            <Switch
              id="schedDefault"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Time Windows</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={!firstEnabledDay}
                  onClick={copyToWeekdays}
                >
                  <Copy className="h-3 w-3" />
                  Copy to weekdays
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={!firstEnabledDay}
                  onClick={copyToAll}
                >
                  <Copy className="h-3 w-3" />
                  Copy to all
                </Button>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {DISPLAY_DAYS.map((dayIndex) => {
                const day = grid[dayIndex];
                return (
                  <div key={dayIndex} className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.enabled}
                        onCheckedChange={(checked) => updateDay(dayIndex, { enabled: checked })}
                      />
                      <span className="w-8 text-sm font-medium">{DAY_LABELS[dayIndex]}</span>
                      {day.enabled && (
                        <div className="flex flex-1 flex-col gap-1">
                          {day.windows.map((win, winIndex) => (
                            <div key={winIndex} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={win.startTime}
                                onChange={(e) => updateWindow(dayIndex, winIndex, { startTime: e.target.value })}
                                className="w-28"
                              />
                              <span className="text-xs text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={win.endTime}
                                onChange={(e) => updateWindow(dayIndex, winIndex, { endTime: e.target.value })}
                                className="w-28"
                              />
                              {day.windows.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => removeWindow(dayIndex, winIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                              {winIndex === day.windows.length - 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => addWindow(dayIndex)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
