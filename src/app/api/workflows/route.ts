import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createWorkflowSchema } from "@/lib/validations";

export async function GET() {
  const workflows = await prisma.agentWorkflow.findMany({
    include: { _count: { select: { steps: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const { steps, ...rest } = parsed.data;
    const workflow = await prisma.agentWorkflow.create({
      data: {
        ...rest,
        steps: steps.length > 0 ? { create: steps } : undefined,
      },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json(workflow, { status: 201 });
  } catch (err) {
    console.error("Workflow create error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
