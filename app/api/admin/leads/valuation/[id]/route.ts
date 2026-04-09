import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { LEAD_CATEGORIES, type LeadCategory } from "@/lib/lead-category";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const raw = body.category;
  const category: LeadCategory | null =
    typeof raw === "string" && LEAD_CATEGORIES.includes(raw as LeadCategory)
      ? (raw as LeadCategory)
      : null;

  if (!category) {
    return NextResponse.json(
      { error: "Categoría inválida (pendiente, gestionado o rechazado)." },
      { status: 400 }
    );
  }

  const updated = await prisma.valuationLead.updateMany({
    where: { id },
    data: { category },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, category });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const deleted = await prisma.valuationLead.deleteMany({
    where: { id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
