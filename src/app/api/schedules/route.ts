import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createScheduleSchema } from "@/lib/validations";

export async function GET() {
  const schedules = await prisma.schedule.findMany({
    include: { windows: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(schedules);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { windows, ...rest } = parsed.data;
  const schedule = await prisma.schedule.create({
    data: {
      ...rest,
      windows: { create: windows },
    },
    include: { windows: true },
  });
  return NextResponse.json(schedule, { status: 201 });
}
