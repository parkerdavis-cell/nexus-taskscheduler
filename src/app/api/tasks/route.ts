import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/lib/validations";
import type { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspace = searchParams.get("workspace");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignee = searchParams.get("assignee");
    const search = searchParams.get("search");
    const goalId = searchParams.get("goalId");

    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
    };

    if (workspace) {
      where.workspace = { slug: workspace };
    }
    if (status && status !== "all") {
      where.status = status;
    } else if (!status) {
      // Default "active" view: exclude completed and archived tasks
      where.status = { notIn: ["DONE", "ARCHIVED"] };
    }
    // status=all → no status filter (show everything)
    if (priority) {
      where.priority = priority;
    }
    if (assignee) {
      where.assignee = assignee;
    }
    if (goalId) {
      where.goalId = goalId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        goal: { select: { id: true, title: true } },
        schedule: { select: { id: true, name: true, color: true } },
        _count: { select: { activities: true, timeBlocks: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { dueDate, ...rest } = parsed.data;
    const task = await prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        goal: { select: { id: true, title: true } },
        schedule: { select: { id: true, name: true, color: true } },
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
