"use client";

import { WorkflowCard } from "@/components/workflows/workflow-card";
import { WorkflowFormDialog } from "@/components/workflows/workflow-form-dialog";
import { useWorkflows } from "@/hooks/use-workflows";

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <WorkflowFormDialog />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading workflows...
        </div>
      ) : !workflows || workflows.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No workflows yet.</p>
          <p className="text-sm mt-1">
            Create a workflow to build step-by-step instructions for Claude.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
}
