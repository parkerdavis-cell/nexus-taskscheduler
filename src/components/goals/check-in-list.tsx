"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIns, useCreateCheckIn } from "@/hooks/use-goals";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface CheckInListProps {
  goalId: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  progressType: string;
}

export function CheckInList({
  goalId,
  targetValue,
  currentValue,
  unit,
  progressType,
}: CheckInListProps) {
  const [value, setValue] = useState(String(currentValue));
  const [note, setNote] = useState("");
  const { data: checkIns } = useCheckIns(goalId);
  const createCheckIn = useCreateCheckIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;

    createCheckIn.mutate(
      {
        goalId,
        value: numValue,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNote("");
          toast.success("Progress updated");
        },
        onError: () => toast.error("Failed to log progress"),
      }
    );
  };

  const unitLabel = progressType === "PERCENTAGE" ? "%" : unit || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Log Progress</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min="0"
              max={progressType === "PERCENTAGE" ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 w-24 text-sm"
              placeholder="Value"
            />
            {unitLabel && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                / {targetValue} {unitLabel}
              </span>
            )}
          </div>
          <Button type="submit" size="sm" className="h-8" disabled={createCheckIn.isPending}>
            Log
          </Button>
        </div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          rows={1}
          className="text-sm resize-none"
        />
      </form>

      {checkIns && checkIns.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-start justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
            >
              <div className="space-y-0.5">
                <span className="font-medium">
                  {checkIn.value}{unitLabel}
                </span>
                {checkIn.note && (
                  <p className="text-xs text-muted-foreground">{checkIn.note}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(checkIn.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
