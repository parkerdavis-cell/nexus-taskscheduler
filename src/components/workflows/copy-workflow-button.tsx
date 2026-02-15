"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { WorkflowWithSteps } from "@/hooks/use-workflows";
import { STEP_TYPE_LABELS } from "@/types";
import type { WorkflowStepType } from "@/types";

interface Props {
  workflow: WorkflowWithSteps;
}

export function CopyWorkflowButton({ workflow }: Props) {
  function handleCopy() {
    const lines: string[] = [];
    lines.push(`# Workflow: ${workflow.name}`);
    if (workflow.description) {
      lines.push(workflow.description);
    }
    lines.push("");

    for (const step of workflow.steps) {
      const typeLabel = STEP_TYPE_LABELS[step.stepType as WorkflowStepType] || step.stepType;
      lines.push(`## Step ${step.sortOrder + 1}: ${step.title} [${typeLabel}]`);

      if (step.stepType === "mcp_tool" && step.toolName) {
        lines.push(`Tool: ${step.toolName}`);
        if (step.toolParams) {
          lines.push(`Params: ${step.toolParams}`);
        }
      }

      if (step.stepType === "bash") {
        lines.push(`\`\`\`bash`);
        lines.push(step.instruction);
        lines.push(`\`\`\``);
      } else {
        lines.push(step.instruction);
      }

      lines.push("");
    }

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied to clipboard");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="h-4 w-4 mr-1" />
      Copy as Markdown
    </Button>
  );
}
