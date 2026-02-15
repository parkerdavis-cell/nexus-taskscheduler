import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateContactSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: parsed.data,
      include: {
        workspace: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      },
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error("PATCH /api/contacts/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
