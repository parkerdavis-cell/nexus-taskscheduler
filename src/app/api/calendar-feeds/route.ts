import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCalendarFeedSchema } from "@/lib/validations";

export async function GET() {
  const feeds = await prisma.calendarFeed.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(feeds);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createCalendarFeedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const feed = await prisma.calendarFeed.create({
    data: parsed.data,
  });
  return NextResponse.json(feed, { status: 201 });
}
