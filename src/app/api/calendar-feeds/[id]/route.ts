import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateCalendarFeedSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const feed = await prisma.calendarFeed.findUnique({ where: { id } });
  if (!feed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(feed);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateCalendarFeedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const feed = await prisma.calendarFeed.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(feed);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const feed = await prisma.calendarFeed.findUnique({ where: { id } });
  if (!feed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete associated calendar events (match by feed id pattern too), then the feed
  await prisma.calendarEvent.deleteMany({
    where: {
      OR: [
        { calendarUrl: feed.url },
        { calendarUrl: { startsWith: `gcal:` }, externalId: { startsWith: `gcal_${feed.url.replace("gcal:", "")}_` } },
      ],
    },
  });
  await prisma.calendarFeed.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
