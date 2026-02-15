"use client";

import { useEffect, useState } from "react";
import { Ship, Building, User, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateWorkspace,
  useUpdateWorkspace,
} from "@/hooks/use-workspaces";
import { toast } from "sonner";

export const ICON_MAP: Record<string, React.ElementType> = {
  ship: Ship,
  building: Building,
  user: User,
  layers: Layers,
};

export const ICON_OPTIONS = [
  { value: "ship", label: "Ship", Icon: Ship },
  { value: "building", label: "Building", Icon: Building },
  { value: "user", label: "User", Icon: User },
  { value: "layers", label: "Layers", Icon: Layers },
];

export const COLOR_OPTIONS = [
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
];

interface WorkspaceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: { id: string; name: string; slug: string; color: string; icon: string };
}

export function WorkspaceFormDialog({ open, onOpenChange, workspace }: WorkspaceFormDialogProps) {
  const isEdit = !!workspace;
  const createWorkspace = useCreateWorkspace();
  const updateWorkspace = useUpdateWorkspace();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState("layers");

  useEffect(() => {
    if (open) {
      if (workspace) {
        setName(workspace.name);
        setSlug(workspace.slug);
        setColor(workspace.color);
        setIcon(workspace.icon);
      } else {
        setName("");
        setSlug("");
        setColor(COLOR_OPTIONS[0]);
        setIcon("layers");
      }
    }
  }, [open, workspace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const payload = { name: name.trim(), slug: slug.trim().toLowerCase(), color, icon };

    if (isEdit) {
      updateWorkspace.mutate(
        { id: workspace.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Workspace updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update workspace"),
        }
      );
    } else {
      createWorkspace.mutate(payload, {
        onSuccess: () => {
          toast.success("Workspace created");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create workspace"),
      });
    }
  };

  const isPending = createWorkspace.isPending || updateWorkspace.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Workspace" : "New Workspace"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wsName">Name</Label>
            <Input
              id="wsName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (
                  !isEdit &&
                  (!slug ||
                    slug ===
                      name
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""))
                ) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }
              }}
              placeholder="My Project"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="wsSlug">Slug</Label>
            <Input
              id="wsSlug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-project"
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
          <div>
            <Label>Icon</Label>
            <div className="mt-1 flex gap-2">
              {ICON_OPTIONS.map(({ value, Icon: Ic }) => (
                <button
                  key={value}
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
                  style={{
                    borderColor: icon === value ? color : "hsl(225 12% 16%)",
                    backgroundColor: icon === value ? color + "20" : "transparent",
                  }}
                  onClick={() => setIcon(value)}
                >
                  <Ic
                    className="h-4 w-4"
                    style={{ color: icon === value ? color : undefined }}
                  />
                </button>
              ))}
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
