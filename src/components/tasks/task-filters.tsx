"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUserName } from "@/hooks/use-user-profile";
import type { TaskFilters } from "@/hooks/use-tasks";

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, onFiltersChange }: TaskFiltersBarProps) {
  const { data: workspaces } = useWorkspaces();
  const { data: profile } = useUserName();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="pl-9 h-9"
        />
      </div>

      <Select
        value={filters.workspace || "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, workspace: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="All Spaces" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Spaces</SelectItem>
          {workspaces?.map((ws) => (
            <SelectItem key={ws.slug} value={ws.slug}>
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

      <Select
        value={filters.status || "active"}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            status: v === "active" ? undefined : v,
          })
        }
      >
        <SelectTrigger className="w-32 h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="REVIEW">Review</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, priority: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-28 h-9">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="BACKLOG">Backlog</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.assignee || "all"}
        onValueChange={(v) =>
          onFiltersChange({ ...filters, assignee: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-32 h-9">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="user">{profile?.name ?? "User"}</SelectItem>
          <SelectItem value="agent">Claude</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
