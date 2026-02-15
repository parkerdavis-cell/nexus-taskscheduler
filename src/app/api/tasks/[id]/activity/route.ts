import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createActivitySchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const activities = await prisma.taskActivity.findMany({
    where: { taskId: id },
  });

  // Sort in JS to handle mixed timestamp formats (space vs T separator)
  activities.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.id.localeCompare(b.id);
  });

  return NextResponse.json(activities);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = createActivitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const activity = await prisma.taskActivity.create({
    data: {
      taskId: id,
      ...parsed.data,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
