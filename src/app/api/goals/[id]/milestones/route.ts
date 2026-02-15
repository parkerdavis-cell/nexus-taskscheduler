import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMilestoneSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: goalId } = await params;
  const body = await request.json();
  const parsed = createMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const count = await prisma.milestone.count({ where: { goalId } });

  const milestone = await prisma.milestone.create({
    data: {
      goalId,
      title: parsed.data.title,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      sortOrder: count,
    },
  });
  return NextResponse.json(milestone, { status: 201 });
}
