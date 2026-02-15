import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateWorkflowSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workflow = await prisma.agentWorkflow.findUnique({
    where: { id },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
  if (!workflow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(workflow);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { steps, ...rest } = parsed.data;

  // If steps provided, replace all existing steps
  if (steps) {
    await prisma.agentWorkflowStep.deleteMany({ where: { workflowId: id } });
    await prisma.agentWorkflowStep.createMany({
      data: steps.map((s) => ({ ...s, workflowId: id })),
    });
  }

  const workflow = await prisma.agentWorkflow.update({
    where: { id },
    data: rest,
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(workflow);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.agentWorkflow.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
