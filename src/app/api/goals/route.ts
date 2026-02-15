import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createGoalSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (workspaceId) where.workspaceId = workspaceId;
  if (status) {
    const statuses = status.split(",");
    where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
  }

  const goals = await prisma.goal.findMany({
    where,
    include: {
      workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute completed task counts
  const goalsWithProgress = await Promise.all(
    goals.map(async (goal) => {
      const completedTaskCount = await prisma.task.count({
        where: { goalId: goal.id, status: "DONE", deletedAt: null },
      });
      const totalTaskCount = await prisma.task.count({
        where: { goalId: goal.id, deletedAt: null },
      });
      return { ...goal, completedTaskCount, totalTaskCount };
    })
  );

  return NextResponse.json(goalsWithProgress);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { targetDate, ...rest } = parsed.data;
  const goal = await prisma.goal.create({
    data: {
      ...rest,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
    include: {
      workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      milestones: true,
      _count: { select: { tasks: true } },
    },
  });
  return NextResponse.json(goal, { status: 201 });
}
