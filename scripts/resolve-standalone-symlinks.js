/**
 * Resolves symlinks in the Next.js standalone output.
 * Next.js creates symlinks for serverExternalPackages that point back to
 * the project's node_modules. These break when packaged by electron-builder.
 * This script replaces each symlink with the actual directory contents.
 */
const fs = require("fs");
const path = require("path");

const standaloneDirs = [
  path.join(__dirname, "..", ".next", "standalone", ".next", "node_modules"),
  path.join(__dirname, "..", ".next", "standalone", "node_modules"),
];

for (const dir of standaloneDirs) {
  if (!fs.existsSync(dir)) continue;

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.lstatSync(fullPath);

    if (stat.isSymbolicLink()) {
      const realPath = fs.realpathSync(fullPath);
      console.log(`Resolving symlink: ${entry} -> ${realPath}`);
      fs.unlinkSync(fullPath);
      fs.cpSync(realPath, fullPath, { recursive: true });
    }
  }
}

console.log("Symlinks resolved.");
