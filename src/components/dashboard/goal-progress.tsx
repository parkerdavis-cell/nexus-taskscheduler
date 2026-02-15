"use client";

import Link from "next/link";
import { Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { daysUntil } from "@/lib/date-utils";

interface GoalItem {
  id: string;
  title: string;
  workspace: { name: string; color: string };
  completedTaskCount: number;
  totalTaskCount: number;
  progressType?: string;
  currentValue?: number;
  targetValue?: number;
  targetDate?: string | null;
  createdAt?: string;
  priority?: string;
}

export function GoalProgress({ goals }: { goals: GoalItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4" />
          Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length > 0 ? (
          goals.map((goal) => {
            let progress: number;
            if (goal.progressType === "PERCENTAGE") {
              progress = Math.min(100, goal.currentValue ?? 0);
            } else if (goal.progressType === "CUSTOM") {
              const tv = goal.targetValue ?? 100;
              progress = tv > 0
                ? Math.min(100, Math.round(((goal.currentValue ?? 0) / tv) * 100))
                : 0;
            } else {
              progress =
                goal.totalTaskCount > 0
                  ? Math.round(
                      (goal.completedTaskCount / goal.totalTaskCount) * 100
                    )
                  : 0;
            }

            const daysLeft = goal.targetDate ? daysUntil(goal.targetDate) : null;
            let deadlineLabel = "";
            let deadlineColor = "";
            if (daysLeft !== null) {
              if (daysLeft < 0) {
                deadlineLabel = `${Math.abs(daysLeft)}d overdue`;
                deadlineColor = "text-red-500";
              } else if (daysLeft === 0) {
                deadlineLabel = "Due today";
                deadlineColor = "text-red-500";
              } else if (daysLeft <= 7) {
                deadlineLabel = `${daysLeft}d left`;
                deadlineColor = "text-orange-500";
              }
            }

            return (
              <Link key={goal.id} href={`/goals/${goal.id}`} className="block group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {goal.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {deadlineLabel && (
                      <span className={`text-[10px] flex items-center gap-0.5 ${deadlineColor}`}>
                        <Calendar className="h-2.5 w-2.5" />
                        {deadlineLabel}
                      </span>
                    )}
                    <span className="text-xs font-bold">{progress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px]"
                    style={{ color: goal.workspace.color }}
                  >
                    {goal.workspace.name}
                  </span>
                  <Progress value={progress} className="h-1.5 flex-1" />
                </div>
              </Link>
            );
          })
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No active goals
          </p>
        )}
      </CardContent>
    </Card>
  );
}
