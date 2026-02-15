import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function GET() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekEnd = endOfDay(addDays(today, 7));

  const [
    workspaces,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    goals,
    todayTimeBlocks,
  ] = await Promise.all([
    // Workspace stats
    prisma.workspace.findMany({
      where: { isArchived: false },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            tasks: { where: { deletedAt: null, status: { not: "DONE" } } },
          },
        },
      },
    }),
    // Overdue tasks
    prisma.task.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ["DONE", "ARCHIVED"] },
        dueDate: { lt: todayStart },
      },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    // Today's tasks
    prisma.task.findMany({
      where: {
        deletedAt: null,
        dueDate: { gte: todayStart, lte: todayEnd },
      },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
      orderBy: [{ priority: "asc" }, { sortOrder: "asc" }],
    }),
    // Upcoming 7 days tasks
    prisma.task.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ["DONE", "ARCHIVED"] },
        dueDate: { gt: todayEnd, lte: weekEnd },
      },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    // Goals with progress
    prisma.goal.findMany({
      where: { status: { not: "COMPLETED" } },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    }),
    // Today's time blocks
    prisma.timeBlock.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
      },
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
      orderBy: { startTime: "asc" },
    }),
  ]);

  // Compute goal progress
  const goalsWithProgress = await Promise.all(
    goals.map(async (goal) => {
      const completedCount = await prisma.task.count({
        where: { goalId: goal.id, status: "DONE", deletedAt: null },
      });
      const totalCount = await prisma.task.count({
        where: { goalId: goal.id, deletedAt: null },
      });
      return {
        ...goal,
        completedTaskCount: completedCount,
        totalTaskCount: totalCount,
      };
    })
  );

  return NextResponse.json({
    workspaces,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    goals: goalsWithProgress,
    todayTimeBlocks,
  });
}
