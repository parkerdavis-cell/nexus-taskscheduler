import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  terminal: {
    spawn: () => ipcRenderer.send("terminal:spawn"),
    write: (data: string) => ipcRenderer.send("terminal:write", data),
    resize: (cols: number, rows: number) =>
      ipcRenderer.send("terminal:resize", cols, rows),
    kill: () => ipcRenderer.send("terminal:kill"),
    onData: (cb: (data: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: string) =>
        cb(data);
      ipcRenderer.on("terminal:data", handler);
      return () => {
        ipcRenderer.removeListener("terminal:data", handler);
      };
    },
    onExit: (cb: (code: number) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, code: number) =>
        cb(code);
      ipcRenderer.on("terminal:exit", handler);
      return () => {
        ipcRenderer.removeListener("terminal:exit", handler);
      };
    },
  },
});
