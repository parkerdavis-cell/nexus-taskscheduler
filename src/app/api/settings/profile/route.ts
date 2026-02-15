import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const setting = await prisma.setting.findUnique({
    where: { key: "user_name" },
  });
  return NextResponse.json({ name: setting?.value ?? "User" });
}

export async function PUT(request: NextRequest) {
  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
    where: { key: "user_name" },
    update: { value: name.trim() },
    create: { key: "user_name", value: name.trim() },
  });

  return NextResponse.json({ name: setting.value });
}
