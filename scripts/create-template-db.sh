#!/bin/bash
# Creates a clean nexus-template.db with empty schema only (no seed data).
# Run before electron-builder packages the app.

set -e
cd "$(dirname "$0")/.."

TEMPLATE="prisma/nexus-template.db"
SOURCE="prisma/nexus.db"

rm -f "$TEMPLATE"

# Extract schema from existing DB (skip _prisma internal tables)
sqlite3 "$SOURCE" ".schema" | grep -v "^CREATE TABLE _prisma" > /tmp/nexus-schema.sql

# Create template DB with schema only
sqlite3 "$TEMPLATE" < /tmp/nexus-schema.sql

# Add _prisma_migrations table so Prisma doesn't complain
sqlite3 "$TEMPLATE" "
CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  finished_at TEXT,
  migration_name TEXT NOT NULL,
  logs TEXT,
  rolled_back_at TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  applied_steps_count INTEGER NOT NULL DEFAULT 0
);
"

rm -f /tmp/nexus-schema.sql
echo "Template DB created at $TEMPLATE (empty — no seed data)"
