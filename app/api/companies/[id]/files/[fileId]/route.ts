import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";
import { readFile } from "fs/promises";
import path from "path";

type Params = { params: Promise<{ id: string; fileId: string }> };

async function canAccessCompanyFiles(companyId: string, userId: string): Promise<boolean> {
  const [company, user] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true, attachmentsApproved: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
  ]);
  if (!company || !user) return false;
  if (company.ownerId === userId || user.role === "ADMIN") return true;
  return company.attachmentsApproved === true;
}

/** Descargar archivo (solo admin o dueño) */
export async function GET(req: Request, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId, fileId } = await params;
  if (!companyId || !fileId) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  const allowed = await canAccessCompanyFiles(companyId, userId);
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado para descargar este documento" }, { status: 403 });
  }

  const fileRecord = await prisma.companyFile.findFirst({
    where: { id: fileId, companyId },
  });
  if (!fileRecord) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), "data", "company-files", fileRecord.storagePath);
  let buffer: Buffer;
  try {
    buffer = await readFile(absolutePath);
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en el servidor" }, { status: 404 });
  }

  const disposition = `attachment; filename="${fileRecord.name.replace(/"/g, "%22")}"`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": fileRecord.mimeType ?? "application/octet-stream",
      "Content-Disposition": disposition,
      "Content-Length": String(buffer.length),
    },
  });
}
