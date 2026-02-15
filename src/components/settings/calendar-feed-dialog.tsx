"use client";

import { useEffect, useState } from "react";
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
  useCreateCalendarFeed,
  useUpdateCalendarFeed,
} from "@/hooks/use-calendar-feeds";
import { COLOR_OPTIONS } from "./workspace-form-dialog";
import { toast } from "sonner";

interface CalendarFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feed?: {
    id: string;
    name: string;
    url: string;
    color: string | null;
    isActive: boolean;
  };
}

export function CalendarFeedDialog({ open, onOpenChange, feed }: CalendarFeedDialogProps) {
  const isEdit = !!feed;
  const createFeed = useCreateCalendarFeed();
  const updateFeed = useUpdateCalendarFeed();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (feed) {
        setName(feed.name);
        setUrl(feed.url);
        setColor(feed.color || COLOR_OPTIONS[0]);
        setIsActive(feed.isActive);
      } else {
        setName("");
        setUrl("");
        setColor(COLOR_OPTIONS[0]);
        setIsActive(true);
      }
    }
  }, [open, feed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const payload = { name: name.trim(), url: url.trim(), color, isActive };

    if (isEdit) {
      updateFeed.mutate(
        { id: feed.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Calendar feed updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update feed"),
        }
      );
    } else {
      createFeed.mutate(payload, {
        onSuccess: () => {
          toast.success("Calendar feed created");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create feed"),
      });
    }
  };

  const isPending = createFeed.isPending || updateFeed.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Calendar Feed" : "New Calendar Feed"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedName">Name</Label>
            <Input
              id="feedName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Work Calendar"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="feedUrl">ICS URL</Label>
            <Input
              id="feedUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://calendar.google.com/...ical"
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
            <Label htmlFor="feedActive">Active</Label>
            <Switch
              id="feedActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
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
