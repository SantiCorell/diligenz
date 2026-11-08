import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { readClientServiceFile } from "@/lib/client-service-files";

type Params = { params: Promise<{ id: string }> };

async function loadFile(id: string) {
  return prisma.serviceIntakeFile.findUnique({
    where: { id },
    include: { intake: { select: { userId: true } } },
  });
}

function canAccess(session: { user: { id: string; role: string } }, userId: string) {
  return session.user.role === "ADMIN" || session.user.id === userId;
}

export async function GET(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const file = await loadFile(id);
  if (!file) return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  if (!canAccess(session, file.intake.userId)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const bytes = await readClientServiceFile(file.storagePath);
  const filename = file.name.replace(/["\r\n]/g, "");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administración puede quitar documentos del servicio." }, { status: 403 });
  }
  const { id } = await params;
  const file = await loadFile(id);
  if (!file) return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  await prisma.serviceIntakeFile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
