import { app, BrowserWindow, ipcMain } from "electron";
import { getRandomPort } from "get-port-please";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let port: number;

// node-pty is a native module — require at runtime so it works in packaged app
let ptyProcess: ReturnType<typeof import("node-pty").spawn> | null = null;

const isDev = !app.isPackaged;
const DEV_PORT = 3456; // Must match the port in electron:dev script

function getDbPath(): string {
  if (isDev) {
    return path.join(process.cwd(), "prisma", "nexus.db");
  }
  return path.join(app.getPath("userData"), "nexus.db");
}

function ensureDatabase(): void {
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) return;

  const templatePath = path.join(
    process.resourcesPath,
    "nexus-template.db"
  );

  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, dbPath);
    console.log(`Copied template DB to ${dbPath}`);
  } else {
    console.error("Template DB not found at", templatePath);
  }
}

function restoreNodeModules(): void {
  // Build step renames node_modules → _modules to survive electron-builder.
  // Rename them back on first launch.
  const standaloneDir = path.join(process.resourcesPath, "standalone");
  const pairs = [
    [path.join(standaloneDir, "_modules"), path.join(standaloneDir, "node_modules")],
    [path.join(standaloneDir, ".next", "_modules"), path.join(standaloneDir, ".next", "node_modules")],
  ];
  for (const [src, dest] of pairs) {
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.renameSync(src, dest);
      console.log(`Restored ${dest}`);
    }
  }
}

async function startProductionServer(): Promise<void> {
  port = await getRandomPort("localhost");
  const dbPath = getDbPath();

  restoreNodeModules();

  const serverPath = path.join(process.resourcesPath, "standalone", "server.js");

  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    PORT: String(port),
    HOSTNAME: "localhost",
    NEXUS_DB_PATH: dbPath,
    NODE_ENV: "production",
    ELECTRON_RUN_AS_NODE: "1",
  };

  // Use Electron's embedded Node.js to run the standalone server
  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: path.join(process.resourcesPath, "standalone"),
    env,
    stdio: "pipe",
  });

  serverProcess.stdout?.on("data", (data: Buffer) => {
    console.log(`[next] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    console.error(`[next] ${data.toString().trim()}`);
  });

  serverProcess.on("error", (err) => {
    console.error("Failed to start Next.js server:", err);
  });
}

async function waitForServer(url: string, timeout = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not start within ${timeout}ms`);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Nexus",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── Terminal IPC ───────────────────────────────────────────────────────
ipcMain.on("terminal:spawn", (event) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pty = require("node-pty");
  const shell = process.env.SHELL || "/bin/zsh";

  if (ptyProcess) {
    ptyProcess.kill();
    ptyProcess = null;
  }

  ptyProcess = pty.spawn(shell, [], {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || "/",
    env: process.env as Record<string, string>,
  });

  ptyProcess!.onData((data: string) => {
    event.sender.send("terminal:data", data);
  });

  ptyProcess!.onExit(({ exitCode }: { exitCode: number }) => {
    event.sender.send("terminal:exit", exitCode);
    ptyProcess = null;
  });
});

ipcMain.on("terminal:write", (_event, data: string) => {
  ptyProcess?.write(data);
});

ipcMain.on("terminal:resize", (_event, cols: number, rows: number) => {
  try {
    ptyProcess?.resize(cols, rows);
  } catch {
    // ignore resize errors
  }
});

ipcMain.on("terminal:kill", () => {
  if (ptyProcess) {
    ptyProcess.kill();
    ptyProcess = null;
  }
});

app.on("ready", async () => {
  if (isDev) {
    // In dev mode, next dev is started by concurrently — just connect to it
    port = DEV_PORT;
  } else {
    ensureDatabase();
    await startProductionServer();
  }

  try {
    await waitForServer(`http://localhost:${port}`);
  } catch (err) {
    console.error("Server startup failed:", err);
    app.quit();
    return;
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (ptyProcess) {
    ptyProcess.kill();
    ptyProcess = null;
  }
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
