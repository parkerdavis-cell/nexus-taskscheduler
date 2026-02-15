/**
 * Creates a clean nexus-template.db with default workspaces and schedules.
 * Run before electron-builder packages the app:
 *   npx tsx scripts/create-template-db.ts
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const templatePath = path.join(process.cwd(), "prisma", "nexus-template.db");

// Remove old template if it exists
if (fs.existsSync(templatePath)) {
  fs.unlinkSync(templatePath);
}

// Copy the current DB schema by reading the migration SQL
// Instead, we'll create a fresh DB from the existing one's schema
const sourceDb = new Database(
  path.join(process.cwd(), "prisma", "nexus.db"),
  { readonly: true }
);

// Get the schema DDL
const tables = sourceDb
  .prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'"
  )
  .all() as { sql: string }[];

const indexes = sourceDb
  .prepare(
    "SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'"
  )
  .all() as { sql: string }[];

sourceDb.close();

// Create template DB with schema
const templateDb = new Database(templatePath);
templateDb.pragma("journal_mode = WAL");

templateDb.exec("BEGIN;");

for (const { sql } of tables) {
  templateDb.exec(sql + ";");
}
for (const { sql } of indexes) {
  templateDb.exec(sql + ";");
}

// Seed default schedules
const now = new Date().toISOString();
const weekdays = [1, 2, 3, 4, 5];

const schedules = [
  { id: "sched_deep", name: "Deep Work", color: "#3b82f6", isDefault: 1, start: "09:00", end: "12:00" },
  { id: "sched_meetings", name: "Meetings", color: "#f97316", isDefault: 0, start: "13:00", end: "15:00" },
  { id: "sched_admin", name: "Admin", color: "#6b7280", isDefault: 0, start: "15:00", end: "17:00" },
];

for (const s of schedules) {
  templateDb
    .prepare(
      `INSERT INTO Schedule (id, name, color, isDefault, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(s.id, s.name, s.color, s.isDefault, now, now);

  for (const day of weekdays) {
    templateDb
      .prepare(
        `INSERT INTO ScheduleWindow (id, dayOfWeek, startTime, endTime, scheduleId)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(`sw_${s.id}_${day}`, day, s.start, s.end, s.id);
  }
}

// Create _prisma_migrations table so Prisma doesn't complain
templateDb.exec(`
  CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id                  TEXT PRIMARY KEY,
    checksum            TEXT NOT NULL,
    finished_at         TEXT,
    migration_name      TEXT NOT NULL,
    logs                TEXT,
    rolled_back_at      TEXT,
    started_at          TEXT NOT NULL DEFAULT (datetime('now')),
    applied_steps_count INTEGER NOT NULL DEFAULT 0
  );
`);

templateDb.exec("COMMIT;");
templateDb.close();

console.log(`Template DB created at ${templatePath}`);
