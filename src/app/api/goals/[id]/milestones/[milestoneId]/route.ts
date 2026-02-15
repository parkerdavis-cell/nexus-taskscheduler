import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateMilestoneSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { milestoneId } = await params;
  const body = await request.json();
  const parsed = updateMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { targetDate, isCompleted, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };

  if (targetDate !== undefined) {
    data.targetDate = targetDate ? new Date(targetDate) : null;
  }

  if (isCompleted !== undefined) {
    data.isCompleted = isCompleted;
    data.completedAt = isCompleted ? new Date() : null;
  }

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data,
  });
  return NextResponse.json(milestone);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { milestoneId } = await params;
  await prisma.milestone.delete({ where: { id: milestoneId } });
  return NextResponse.json({ success: true });
}
