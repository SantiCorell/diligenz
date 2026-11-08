import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id, docId } = await params;
  const document = await prisma.clientServiceDocument.findFirst({
    where: { id: docId, serviceId: id },
    select: { id: true },
  });
  if (!document) return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  await prisma.clientServiceDocument.delete({ where: { id: docId } });
  return NextResponse.json({ ok: true });
}
