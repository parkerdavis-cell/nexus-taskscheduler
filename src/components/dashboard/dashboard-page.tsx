"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Calendar, Layers, Plus, Rocket } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceCards } from "./workspace-cards";
import { TodaySummary } from "./today-summary";
import { GoalProgress } from "./goal-progress";
import { QuickAddTask } from "./quick-add-task";
import { WorkspaceFormDialog } from "@/components/settings/workspace-form-dialog";
import { formatShortDate } from "@/lib/date-utils";
import Link from "next/link";

interface DashboardData {
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
    _count: { tasks: number };
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    workspace: { name: string; color: string };
  }>;
  todayTasks: Array<Record<string, unknown>>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    workspace: { name: string; color: string };
  }>;
  goals: Array<{
    id: string;
    title: string;
    workspace: { name: string; color: string };
    completedTaskCount: number;
    totalTaskCount: number;
  }>;
  todayTimeBlocks: Array<Record<string, unknown>>;
}

export function DashboardPage() {
  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  // Show welcome/onboarding when no workspaces exist
  if (data.workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Nexus</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Get started by creating your first workspace. Workspaces keep your tasks, goals, and contacts organized by project or area of life.
        </p>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setWsDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Create Your First Workspace
        </Button>
        <WorkspaceFormDialog
          open={wsDialogOpen}
          onOpenChange={setWsDialogOpen}
        />
      </div>
    );
  }

  // Group upcoming tasks by day
  const upcomingByDay: Record<string, typeof data.upcomingTasks> = {};
  data.upcomingTasks.forEach((task) => {
    const day = format(new Date(task.dueDate), "yyyy-MM-dd");
    if (!upcomingByDay[day]) upcomingByDay[day] = [];
    upcomingByDay[day].push(task);
  });

  return (
    <div className="space-y-6">
      {/* Overdue banner */}
      {data.overdueTasks.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">
              {data.overdueTasks.length} Overdue{" "}
              {data.overdueTasks.length === 1 ? "Task" : "Tasks"}
            </span>
          </div>
          <div className="space-y-1">
            {data.overdueTasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.workspace.color }}
                />
                <span>{task.title}</span>
                <span className="text-xs text-destructive">
                  Due {formatShortDate(task.dueDate)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Today + Workspaces */}
        <div className="lg:col-span-2 space-y-6">
          <TodaySummary
            tasks={data.todayTasks as never}
            timeBlocks={data.todayTimeBlocks as never}
          />
          <WorkspaceCards workspaces={data.workspaces} />
        </div>

        {/* Right - Goals + Upcoming */}
        <div className="space-y-6">
          <GoalProgress goals={data.goals} />

          {/* Upcoming deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(upcomingByDay).length > 0 ? (
                Object.entries(upcomingByDay)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([day, tasks]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(day), "EEE, MMM d")}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                      </Badge>
                    </div>
                  ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No upcoming deadlines
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
