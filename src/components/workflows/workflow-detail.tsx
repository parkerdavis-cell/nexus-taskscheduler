"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflow, useUpdateWorkflow, useDeleteWorkflow } from "@/hooks/use-workflows";
import { WorkflowStepList } from "./workflow-step-list";
import { CopyWorkflowButton } from "./copy-workflow-button";
import { toast } from "sonner";

export function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const { data: workflow, isLoading } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!workflow) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Workflow not found
      </div>
    );
  }

  function saveName() {
    if (!nameDraft.trim() || !workflow) return;
    updateWorkflow.mutate(
      { id: workflow.id, name: nameDraft.trim() },
      { onSuccess: () => setEditingName(false) }
    );
  }

  function saveDesc() {
    if (!workflow) return;
    updateWorkflow.mutate(
      { id: workflow.id, description: descDraft.trim() || null },
      { onSuccess: () => setEditingDesc(false) }
    );
  }

  function handleDelete() {
    if (!workflow) return;
    if (!confirm("Delete this workflow?")) return;
    deleteWorkflow.mutate(workflow.id, {
      onSuccess: () => {
        toast.success("Workflow deleted");
        router.push("/workflows");
      },
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/workflows"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Workflows
        </Link>
        <div className="flex items-center gap-2">
          <CopyWorkflowButton workflow={workflow} />
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Name */}
      {editingName ? (
        <Input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveName();
            if (e.key === "Escape") setEditingName(false);
          }}
          className="text-2xl font-bold h-auto py-1"
          autoFocus
        />
      ) : (
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-primary/80 transition-colors"
          onClick={() => {
            setNameDraft(workflow.name);
            setEditingName(true);
          }}
        >
          {workflow.name}
        </h1>
      )}

      {/* Description */}
      {editingDesc ? (
        <Textarea
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          onBlur={saveDesc}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditingDesc(false);
          }}
          rows={2}
          className="text-sm"
          autoFocus
        />
      ) : (
        <p
          className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          onClick={() => {
            setDescDraft(workflow.description || "");
            setEditingDesc(true);
          }}
        >
          {workflow.description || "Click to add a description..."}
        </p>
      )}

      {/* Steps */}
      <WorkflowStepList workflowId={workflow.id} steps={workflow.steps} />
    </div>
  );
}
