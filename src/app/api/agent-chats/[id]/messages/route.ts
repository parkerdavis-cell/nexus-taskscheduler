import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const message = await prisma.agentMessage.create({
    data: {
      chatId: id,
      role: body.role || "user",
      content: body.content,
    },
  });

  // Update chat's updatedAt
  await prisma.agentChat.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  // Auto-title the chat from the first user message
  const chat = await prisma.agentChat.findUnique({ where: { id } });
  if (chat?.title === "New Chat" && body.role === "user") {
    const title = body.content.slice(0, 50) + (body.content.length > 50 ? "..." : "");
    await prisma.agentChat.update({
      where: { id },
      data: { title },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
