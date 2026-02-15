import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateGoalSchema } from "@/lib/validations";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
      tasks: {
        where: { deletedAt: null },
        include: {
          workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      checkIns: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { tasks: true } },
    },
  });

  if (!goal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [completedTaskCount, totalTaskCount, completedTimeBlocks] = await Promise.all([
    prisma.task.count({
      where: { goalId: id, status: "DONE", deletedAt: null },
    }),
    prisma.task.count({
      where: { goalId: id, deletedAt: null },
    }),
    prisma.timeBlock.findMany({
      where: {
        task: { goalId: id, deletedAt: null },
        status: "COMPLETED",
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  // Calculate time invested in minutes
  const timeInvestedMins = completedTimeBlocks.reduce((sum, block) => {
    return sum + (timeToMinutes(block.endTime) - timeToMinutes(block.startTime));
  }, 0);

  return NextResponse.json({
    ...goal,
    completedTaskCount,
    totalTaskCount,
    timeInvestedMins,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { targetDate, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (targetDate !== undefined) {
    data.targetDate = targetDate ? new Date(targetDate) : null;
  }

  // Auto-set completedAt when status changes
  if (rest.status === "COMPLETED") {
    data.completedAt = new Date();
  } else if (rest.status) {
    data.completedAt = null;
  }

  const goal = await prisma.goal.update({
    where: { id },
    data,
    include: {
      workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
      _count: { select: { tasks: true } },
    },
  });
  return NextResponse.json(goal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
