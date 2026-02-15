/**
 * Prepares the Next.js standalone output for Electron packaging.
 *
 * 1. Copies .next/standalone → standalone-build/ (outside .next so
 *    electron-builder doesn't filter node_modules)
 * 2. Copies .next/static → standalone-build/.next/static
 * 3. Copies public/ → standalone-build/public
 * 4. Resolves any symlinks in node_modules (Next.js creates these
 *    for serverExternalPackages)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, ".next", "standalone");
const dest = path.join(root, "standalone-build");

// Clean previous build
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}

// Copy standalone output
console.log("Copying standalone build...");
fs.cpSync(src, dest, { recursive: true });

// Copy static files
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(dest, ".next", "static");
if (fs.existsSync(staticSrc)) {
  console.log("Copying static assets...");
  fs.cpSync(staticSrc, staticDest, { recursive: true });
}

// Copy public directory
const publicSrc = path.join(root, "public");
const publicDest = path.join(dest, "public");
if (fs.existsSync(publicSrc)) {
  console.log("Copying public assets...");
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

// Resolve symlinks in all node_modules directories
function resolveSymlinks(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.lstatSync(fullPath);

    if (stat.isSymbolicLink()) {
      const realPath = fs.realpathSync(fullPath);
      console.log(`Resolving symlink: ${entry} → ${path.basename(realPath)}`);
      fs.unlinkSync(fullPath);
      fs.cpSync(realPath, fullPath, { recursive: true });
    }
  }
}

resolveSymlinks(path.join(dest, "node_modules"));
resolveSymlinks(path.join(dest, ".next", "node_modules"));

// Rename node_modules → _modules so electron-builder doesn't strip them.
// The Electron main process renames them back at startup.
const nmDirs = [
  path.join(dest, "node_modules"),
  path.join(dest, ".next", "node_modules"),
];
for (const nm of nmDirs) {
  const renamed = nm.replace("node_modules", "_modules");
  if (fs.existsSync(nm)) {
    fs.renameSync(nm, renamed);
    console.log(`Renamed ${path.relative(root, nm)} → _modules`);
  }
}

console.log("Standalone build prepared at standalone-build/");
