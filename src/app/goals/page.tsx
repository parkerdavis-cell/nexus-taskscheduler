"use client";

import { useState } from "react";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalFormDialog } from "@/components/goals/goal-form";
import { useGoals } from "@/hooks/use-goals";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Active", value: "NOT_STARTED,IN_PROGRESS" },
  { label: "Paused", value: "PAUSED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "All", value: "" },
] as const;

const PRIORITY_ORDER: Record<string, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].value);
  const statusFilter = activeTab || undefined;
  const { data: goals, isLoading } = useGoals(undefined, statusFilter);
  const { data: workspaces } = useWorkspaces();

  // Sort by priority within groups
  const sortedGoals = [...(goals || [])].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
  );

  // Group goals by workspace
  const grouped = sortedGoals.reduce<Record<string, typeof sortedGoals>>(
    (acc, goal) => {
      const key = goal.workspaceId;
      if (!acc[key]) acc[key] = [];
      acc[key]!.push(goal);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <GoalFormDialog />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : sortedGoals.length > 0 ? (
        <div className="space-y-8">
          {workspaces?.map((ws) => {
            const wsGoals = grouped[ws.id];
            if (!wsGoals?.length) return null;
            return (
              <div key={ws.id}>
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: ws.color }}
                  />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {ws.name}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wsGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">
            {activeTab === "COMPLETED"
              ? "No completed goals yet"
              : activeTab === "PAUSED"
                ? "No paused goals"
                : "No goals yet"}
          </p>
          <p className="text-sm">
            {activeTab === TABS[0].value
              ? "Create a goal to start tracking progress"
              : "Goals matching this filter will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
