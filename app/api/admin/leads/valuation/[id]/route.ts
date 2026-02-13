import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

const CATEGORIES = ["activo", "pruebas", "archivado"] as const;

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const category = body.category === null || body.category === undefined
    ? null
    : typeof body.category === "string" && CATEGORIES.includes(body.category as typeof CATEGORIES[number])
      ? body.category
      : null;

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
