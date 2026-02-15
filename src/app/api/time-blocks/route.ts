import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTimeBlockSchema } from "@/lib/validations";

/** Parse YYYY-MM-DD as local midnight (not UTC) */
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const taskId = searchParams.get("taskId");

  const where: Record<string, unknown> = {};
  if (start && end) {
    where.date = {
      gte: parseLocalDate(start),
      lte: parseLocalDate(end),
    };
  }
  if (taskId) {
    where.taskId = taskId;
  }

  const blocks = await prisma.timeBlock.findMany({
    where,
    include: {
      task: { select: { id: true, title: true, priority: true, status: true, workspaceId: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(blocks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createTimeBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const block = await prisma.timeBlock.create({
    data: {
      ...rest,
      date: parseLocalDate(date),
    },
    include: {
      task: { select: { id: true, title: true, priority: true, status: true, workspaceId: true } },
    },
  });
  return NextResponse.json(block, { status: 201 });
}
