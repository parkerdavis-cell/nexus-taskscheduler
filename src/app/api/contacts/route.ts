import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createContactSchema } from "@/lib/validations";
import type { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspace = searchParams.get("workspace");
    const search = searchParams.get("search");

    const where: Prisma.ContactWhereInput = {};

    if (workspace) {
      where.workspace = { slug: workspace };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
        { role: { contains: search } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: parsed.data,
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
