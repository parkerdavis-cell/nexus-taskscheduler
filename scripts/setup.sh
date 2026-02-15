#!/bin/bash
# Nexus — First-time setup script
# Creates .env, generates Prisma client, creates database, and seeds default data

set -e

echo "Setting up Nexus..."

# 1. Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Created .env from .env.example"
else
  echo "✓ .env already exists"
fi

# 2. Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"

# 3. Create database
echo "Creating database..."
npx prisma db push
echo "✓ Database created at prisma/nexus.db"

# 4. Seed default schedules
echo "Seeding default data..."
npx tsx prisma/seed.ts
echo "✓ Default schedules seeded"

echo ""
echo "Setup complete! Run 'npm run dev' to start Nexus."
