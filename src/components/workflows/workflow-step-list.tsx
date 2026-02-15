"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  ChevronRight,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateWorkflow } from "@/hooks/use-workflows";
import type { WorkflowStep } from "@/hooks/use-workflows";
import {
  STEP_TYPE_LABELS,
  STEP_TYPE_COLORS,
} from "@/types";
import type { WorkflowStepType } from "@/types";
import { toast } from "sonner";

interface LocalStep {
  localId: string;
  title: string;
  stepType: WorkflowStepType;
  instruction: string;
  toolName: string;
  toolParams: string;
}

interface Props {
  workflowId: string;
  steps: WorkflowStep[];
}

function toLocal(steps: WorkflowStep[]): LocalStep[] {
  return steps.map((s) => ({
    localId: s.id,
    title: s.title,
    stepType: s.stepType as WorkflowStepType,
    instruction: s.instruction,
    toolName: s.toolName || "",
    toolParams: s.toolParams || "",
  }));
}

export function WorkflowStepList({ workflowId, steps }: Props) {
  const [localSteps, setLocalSteps] = useState<LocalStep[]>(() => toLocal(steps));
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const updateWorkflow = useUpdateWorkflow();

  // Sync from server when steps change (but not if user has unsaved edits)
  useEffect(() => {
    if (!dirty) {
      setLocalSteps(toLocal(steps));
    }
  }, [steps, dirty]);

  const markDirty = useCallback(() => setDirty(true), []);

  function updateStep(idx: number, patch: Partial<LocalStep>) {
    setLocalSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
    markDirty();
  }

  function addStep() {
    setLocalSteps((prev) => [
      ...prev,
      {
        localId: `temp-${Date.now()}`,
        title: "",
        stepType: "instruction",
        instruction: "",
        toolName: "",
        toolParams: "",
      },
    ]);
    setExpandedIdx(localSteps.length);
    markDirty();
  }

  function removeStep(idx: number) {
    setLocalSteps((prev) => prev.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
    markDirty();
  }

  function moveStep(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= localSteps.length) return;
    setLocalSteps((prev) => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
    if (expandedIdx === idx) setExpandedIdx(newIdx);
    else if (expandedIdx === newIdx) setExpandedIdx(idx);
    markDirty();
  }

  function handleSave() {
    const stepsPayload = localSteps.map((s, i) => ({
      sortOrder: i,
      title: s.title || `Step ${i + 1}`,
      stepType: s.stepType,
      instruction: s.instruction,
      toolName: s.stepType === "mcp_tool" && s.toolName ? s.toolName : undefined,
      toolParams: s.stepType === "mcp_tool" && s.toolParams ? s.toolParams : undefined,
    }));

    updateWorkflow.mutate(
      { id: workflowId, steps: stepsPayload },
      {
        onSuccess: () => {
          setDirty(false);
          toast.success("Steps saved");
        },
        onError: () => toast.error("Failed to save steps"),
      }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Steps
        </h2>
        <div className="flex gap-2">
          {dirty && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateWorkflow.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {localSteps.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No steps yet. Add a step to start building your workflow.
        </p>
      )}

      <div className="space-y-2">
        {localSteps.map((step, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={step.localId}
              className="border rounded-md bg-card overflow-hidden"
            >
              {/* Header row */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
                <span className="text-sm text-muted-foreground w-6 shrink-0">
                  {idx + 1}.
                </span>
                <Badge
                  className="shrink-0 text-[10px] px-1.5"
                  style={{
                    backgroundColor: STEP_TYPE_COLORS[step.stepType] + "15",
                    color: STEP_TYPE_COLORS[step.stepType],
                    border: "none",
                  }}
                >
                  {STEP_TYPE_LABELS[step.stepType]}
                </Badge>
                <span className="text-sm font-medium truncate flex-1">
                  {step.title || "Untitled step"}
                </span>
                <div
                  className="flex items-center gap-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, -1)}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={idx === localSteps.length - 1}
                    onClick={() => moveStep(idx, 1)}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeStep(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t pt-3">
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) =>
                          updateStep(idx, { title: e.target.value })
                        }
                        placeholder="Step title"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={step.stepType}
                        onValueChange={(v) =>
                          updateStep(idx, {
                            stepType: v as WorkflowStepType,
                          })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instruction">
                            Instruction
                          </SelectItem>
                          <SelectItem value="mcp_tool">MCP Tool</SelectItem>
                          <SelectItem value="bash">Bash Command</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {step.stepType === "mcp_tool" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tool Name</Label>
                        <Input
                          value={step.toolName}
                          onChange={(e) =>
                            updateStep(idx, { toolName: e.target.value })
                          }
                          placeholder="e.g. mcp__aws-cloudwatch__get_metric_data"
                          className="font-mono text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Parameters (JSON)</Label>
                        <Input
                          value={step.toolParams}
                          onChange={(e) =>
                            updateStep(idx, { toolParams: e.target.value })
                          }
                          placeholder='{"key": "value"}'
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">
                      {step.stepType === "bash"
                        ? "Command"
                        : step.stepType === "mcp_tool"
                        ? "Additional Instructions"
                        : "Instructions"}
                    </Label>
                    <Textarea
                      value={step.instruction}
                      onChange={(e) =>
                        updateStep(idx, { instruction: e.target.value })
                      }
                      placeholder={
                        step.stepType === "bash"
                          ? "npm run test"
                          : "Describe what Claude should do..."
                      }
                      rows={3}
                      className={step.stepType === "bash" ? "font-mono text-sm" : ""}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="outline" size="sm" onClick={addStep} className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        Add Step
      </Button>
    </div>
  );
}
