import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCheckInSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const checkIns = await prisma.goalCheckIn.findMany({
    where: { goalId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(checkIns);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = createCheckInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const checkIn = await prisma.goalCheckIn.create({
    data: {
      goalId: id,
      ...parsed.data,
    },
  });

  // Update goal's currentValue to match latest check-in
  await prisma.goal.update({
    where: { id },
    data: { currentValue: parsed.data.value },
  });

  return NextResponse.json(checkIn, { status: 201 });
}
