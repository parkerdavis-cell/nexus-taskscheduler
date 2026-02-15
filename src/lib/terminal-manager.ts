// Server-side terminal manager using node-pty
// Maintains multiple pty sessions keyed by session ID (one per chat)

type DataListener = (data: string) => void;
type ExitListener = (code: number) => void;

interface PtyProcess {
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  onData: (cb: DataListener) => { dispose: () => void };
  onExit: (cb: (e: { exitCode: number }) => void) => { dispose: () => void };
}

interface Session {
  pty: PtyProcess;
  dataListeners: Set<DataListener>;
  exitListeners: Set<ExitListener>;
}

class TerminalManager {
  private sessions = new Map<string, Session>();

  spawn(sessionId: string): void {
    // Kill existing session with same ID
    if (this.sessions.has(sessionId)) {
      this.kill(sessionId);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodePty = require("node-pty");
      const shell = process.env.SHELL || "/bin/zsh";

      const pty: PtyProcess = nodePty.spawn(shell, [], {
        name: "xterm-256color",
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || "/",
        env: process.env as Record<string, string>,
      });

      const session: Session = {
        pty,
        dataListeners: new Set(),
        exitListeners: new Set(),
      };

      this.sessions.set(sessionId, session);

      pty.onData((data: string) => {
        for (const cb of session.dataListeners) {
          cb(data);
        }
      });

      pty.onExit(({ exitCode }: { exitCode: number }) => {
        for (const cb of session.exitListeners) {
          cb(exitCode);
        }
        this.sessions.delete(sessionId);
      });
    } catch (err) {
      console.error("Failed to spawn terminal:", err);
      throw err;
    }
  }

  write(sessionId: string, data: string): void {
    this.sessions.get(sessionId)?.pty.write(data);
  }

  resize(sessionId: string, cols: number, rows: number): void {
    try {
      this.sessions.get(sessionId)?.pty.resize(cols, rows);
    } catch {
      // ignore resize errors
    }
  }

  kill(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pty.kill();
      this.sessions.delete(sessionId);
    }
  }

  onData(sessionId: string, cb: DataListener): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) return () => {};
    session.dataListeners.add(cb);
    return () => session.dataListeners.delete(cb);
  }

  onExit(sessionId: string, cb: ExitListener): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) return () => {};
    session.exitListeners.add(cb);
    return () => session.exitListeners.delete(cb);
  }

  isAlive(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  killAll(): void {
    for (const [id] of this.sessions) {
      this.kill(id);
    }
  }
}

// Singleton — survives across API requests in the same server process
const globalForTerminal = globalThis as unknown as {
  terminalManager?: TerminalManager;
};

export const terminalManager =
  globalForTerminal.terminalManager ?? new TerminalManager();

globalForTerminal.terminalManager = terminalManager;
