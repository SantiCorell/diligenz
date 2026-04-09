import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

const MAX_LEN = 8000;

type Params = { params: Promise<{ id: string }> };

/** Nota libre del vendedor sobre documentación (siempre editable por el dueño). */
export async function POST(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId } = await params;
  if (!companyId) {
    return NextResponse.json({ error: "Empresa no indicada" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true, removedAt: true },
  });
  if (!company || company.removedAt) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }
  if (company.ownerId !== session.userId) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  let note = "";
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    note = typeof body?.note === "string" ? body.note : "";
  } else {
    const fd = await req.formData();
    note = fd.get("note")?.toString() ?? "";
  }
  const trimmed = note.trim().slice(0, MAX_LEN);

  await prisma.company.update({
    where: { id: companyId },
    data: { sellerDocumentsNote: trimmed.length > 0 ? trimmed : null },
  });

  if (ct.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(
    new URL(`/dashboard/seller/companies/${companyId}?success=note`, origin)
  );
}
