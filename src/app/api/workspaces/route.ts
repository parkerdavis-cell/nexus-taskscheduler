import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createWorkspaceSchema } from "@/lib/validations";

export async function GET() {
  const workspaces = await prisma.workspace.findMany({
    where: { isArchived: false },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(workspaces);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const workspace = await prisma.workspace.create({
    data: parsed.data,
  });
  return NextResponse.json(workspace, { status: 201 });
}
