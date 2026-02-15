"use client";

import { useEffect, useRef } from "react";
import { Terminal as TerminalIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function TerminalPanel({ isOpen, onClose, sessionId }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<unknown>(null);
  const fitAddonRef = useRef<unknown>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current || !sessionId) return;

    let term: InstanceType<typeof import("@xterm/xterm").Terminal>;
    let fitAddon: InstanceType<typeof import("@xterm/addon-fit").FitAddon>;

    async function init() {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      // @ts-expect-error - CSS import for side effects
      await import("@xterm/xterm/css/xterm.css");

      term = new Terminal({
        fontFamily: "var(--font-geist-mono), Monaco, Menlo, monospace",
        fontSize: 13,
        lineHeight: 1.3,
        cursorBlink: true,
        theme: {
          background: "#0a0a0a",
          foreground: "#e5e5e5",
          cursor: "#e5e5e5",
          selectionBackground: "#ffffff30",
        },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current!);

      try {
        fitAddon.fit();
      } catch {
        // container might not be sized yet
      }

      termRef.current = term;
      fitAddonRef.current = fitAddon;

      // Connect via SSE to the session-specific terminal
      const es = new EventSource(`/api/terminal?sessionId=${encodeURIComponent(sessionId)}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        const binary = atob(event.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        term.write(bytes);
      };

      es.addEventListener("exit", (event) => {
        const code = parseInt((event as MessageEvent).data, 10);
        term.write(`\r\n[Process exited with code ${code}]\r\n`);
      });

      term.onData((data) => {
        fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "write", sessionId, data }),
        });
      });

      term.onResize(({ cols, rows }) => {
        fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "resize", sessionId, cols, rows }),
        });
      });

      setTimeout(() => {
        try {
          fitAddon.fit();
        } catch {
          // ignore
        }
      }, 100);
    }

    init();

    const handleResize = () => {
      try {
        if (fitAddonRef.current) {
          (fitAddonRef.current as { fit: () => void }).fit();
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (termRef.current) {
        (termRef.current as { dispose: () => void }).dispose();
        termRef.current = null;
      }
    };
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <div className="border-t border-border bg-[#0a0a0a]" style={{ height: 280 }}>
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TerminalIcon className="h-3.5 w-3.5" />
          Terminal
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div ref={containerRef} className="h-[calc(100%-32px)] w-full" />
    </div>
  );
}
