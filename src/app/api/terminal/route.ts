import { NextRequest, NextResponse } from "next/server";
import { terminalManager } from "@/lib/terminal-manager";

// GET — Server-Sent Events stream of terminal output for a session
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  // Spawn if not already alive
  if (!terminalManager.isAlive(sessionId)) {
    terminalManager.spawn(sessionId);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const removeData = terminalManager.onData(sessionId, (data) => {
        const b64 = Buffer.from(data).toString("base64");
        controller.enqueue(encoder.encode(`data: ${b64}\n\n`));
      });

      const removeExit = terminalManager.onExit(sessionId, (code) => {
        controller.enqueue(
          encoder.encode(`event: exit\ndata: ${code}\n\n`)
        );
        controller.close();
      });

      // Keep-alive and detect client disconnect
      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(checkClosed);
          removeData();
          removeExit();
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// POST — write input, resize, or kill a terminal session
export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionId = body.sessionId;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  switch (body.action) {
    case "write":
      terminalManager.write(sessionId, body.data);
      return NextResponse.json({ ok: true });

    case "resize":
      terminalManager.resize(sessionId, body.cols, body.rows);
      return NextResponse.json({ ok: true });

    case "kill":
      terminalManager.kill(sessionId);
      return NextResponse.json({ ok: true });

    case "spawn":
      terminalManager.spawn(sessionId);
      return NextResponse.json({ ok: true });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
