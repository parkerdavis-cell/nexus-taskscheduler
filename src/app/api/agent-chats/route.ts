import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const chats = await prisma.agentChat.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, role: true },
      },
    },
  });
  return NextResponse.json(chats);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const chat = await prisma.agentChat.create({
    data: { title: body.title || "New Chat" },
  });
  return NextResponse.json(chat, { status: 201 });
}
