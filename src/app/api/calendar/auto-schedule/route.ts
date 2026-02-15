import { NextRequest, NextResponse } from "next/server";
import { autoScheduleSchema } from "@/lib/validations";
import { generateSchedule } from "@/lib/auto-scheduler";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = autoScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { startDate, endDate, dryRun } = parsed.data;
  // Parse as local midnight (not UTC) to match how dates are stored
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const result = await generateSchedule(
    new Date(sy, sm - 1, sd),
    new Date(ey, em - 1, ed),
    dryRun
  );

  return NextResponse.json(result);
}
