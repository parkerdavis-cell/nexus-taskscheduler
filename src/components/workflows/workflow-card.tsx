"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkflowWithSteps } from "@/hooks/use-workflows";
import { STEP_TYPE_LABELS, STEP_TYPE_COLORS } from "@/types";
import type { WorkflowStepType } from "@/types";

interface Props {
  workflow: WorkflowWithSteps;
}

export function WorkflowCard({ workflow }: Props) {
  const stepCount = workflow._count?.steps ?? workflow.steps?.length ?? 0;

  // Count steps by type
  const typeCounts: Partial<Record<WorkflowStepType, number>> = {};
  if (workflow.steps) {
    for (const step of workflow.steps) {
      const t = step.stepType as WorkflowStepType;
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  }

  return (
    <Link href={`/workflows/${workflow.id}`}>
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <CardContent className="pt-4 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate">{workflow.name}</h3>
            <Badge variant="secondary" className="shrink-0 ml-2">
              {stepCount} step{stepCount !== 1 ? "s" : ""}
            </Badge>
          </div>
          {workflow.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workflow.description}
            </p>
          )}
          {Object.keys(typeCounts).length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {(Object.entries(typeCounts) as [WorkflowStepType, number][]).map(
                ([type, count]) => (
                  <span
                    key={type}
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: STEP_TYPE_COLORS[type] + "15",
                      color: STEP_TYPE_COLORS[type],
                    }}
                  >
                    {count} {STEP_TYPE_LABELS[type]}
                  </span>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
