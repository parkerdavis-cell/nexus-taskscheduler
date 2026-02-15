import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateTimeBlockSchema } from "@/lib/validations";

/** Parse YYYY-MM-DD as local midnight (not UTC) */
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateTimeBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (date !== undefined) {
    data.date = date ? parseLocalDate(date) : null;
  }

  const block = await prisma.timeBlock.update({
    where: { id },
    data,
    include: {
      task: { select: { id: true, title: true, priority: true, status: true, workspaceId: true } },
    },
  });
  return NextResponse.json(block);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.timeBlock.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
