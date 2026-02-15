import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        goal: { select: { id: true, title: true } },
        schedule: { select: { id: true, name: true, color: true } },
        timeBlocks: { orderBy: { date: "asc" } },
        _count: { select: { activities: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { dueDate, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };

    if (dueDate !== undefined) {
      data.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // Auto-set completedAt when marking as DONE
    if (rest.status === "DONE") {
      data.completedAt = new Date();
    } else if (rest.status) {
      data.completedAt = null;
    }

    // Fetch existing task for change detection
    const existing = await prisma.task.findUnique({ where: { id }, select: { assignee: true } });

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        goal: { select: { id: true, title: true } },
        schedule: { select: { id: true, name: true, color: true } },
      },
    });

    // Record status change activity
    if (rest.status) {
      await prisma.taskActivity.create({
        data: {
          taskId: id,
          type: "STATUS_CHANGE",
          content: `Status changed to ${rest.status}`,
          author: "user",
        },
      });
    }

    // Record assignment change activity
    if (rest.assignee && existing && rest.assignee !== existing.assignee) {
      const nameSetting = await prisma.setting.findUnique({ where: { key: "user_name" } });
      const label = rest.assignee === "user" ? (nameSetting?.value ?? "User") : "Agent";
      await prisma.taskActivity.create({
        data: {
          taskId: id,
          type: "ASSIGNMENT",
          content: `Assigned to ${label}`,
          author: "user",
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
