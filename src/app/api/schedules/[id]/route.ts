import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateScheduleSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: { windows: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
  });
  if (!schedule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(schedule);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { windows, ...rest } = parsed.data;

  // If setting as default, unset all other schedules first
  if (rest.isDefault) {
    await prisma.schedule.updateMany({ where: { id: { not: id } }, data: { isDefault: false } });
  }

  // If windows provided, replace all existing windows
  if (windows) {
    await prisma.scheduleWindow.deleteMany({ where: { scheduleId: id } });
    await prisma.scheduleWindow.createMany({
      data: windows.map((w) => ({ ...w, scheduleId: id })),
    });
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data: rest,
    include: { windows: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
  });
  return NextResponse.json(schedule);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.schedule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
