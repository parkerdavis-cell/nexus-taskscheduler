import { NextResponse } from "next/server";
import { syncAllCalendarFeeds } from "@/lib/ics-sync";

export async function POST() {
  try {
    const results = await syncAllCalendarFeeds();
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
