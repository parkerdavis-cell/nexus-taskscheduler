import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "nexus.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed default schedules
  const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri

  const deepWork = await prisma.schedule.upsert({
    where: { name: "Deep Work" },
    update: {},
    create: {
      name: "Deep Work",
      color: "#3b82f6",
      isDefault: true,
      windows: {
        create: WEEKDAYS.map((day) => ({
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "12:00",
        })),
      },
    },
  });

  const meetings = await prisma.schedule.upsert({
    where: { name: "Meetings" },
    update: {},
    create: {
      name: "Meetings",
      color: "#f97316",
      windows: {
        create: WEEKDAYS.map((day) => ({
          dayOfWeek: day,
          startTime: "13:00",
          endTime: "15:00",
        })),
      },
    },
  });

  const admin = await prisma.schedule.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      color: "#6b7280",
      windows: {
        create: WEEKDAYS.map((day) => ({
          dayOfWeek: day,
          startTime: "15:00",
          endTime: "17:00",
        })),
      },
    },
  });

  console.log("Seeded schedules:", { deepWork, meetings, admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
