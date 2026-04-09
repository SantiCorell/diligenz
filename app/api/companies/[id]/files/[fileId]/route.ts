import { NextResponse } from "next/server";
import { canOwnerEditCompanyListing } from "@/lib/company-owner-edit";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";
import { readFile, unlink } from "fs/promises";
import path from "path";

type Params = { params: Promise<{ id: string; fileId: string }> };

async function canAccessCompanyFiles(companyId: string, userId: string): Promise<boolean> {
  const [company, user] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true, attachmentsApproved: true, removedAt: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
  ]);
  if (!company || !user) return false;
  if (company.removedAt) {
    return company.ownerId === userId || user.role === "ADMIN";
  }
  if (company.ownerId === userId || user.role === "ADMIN") return true;
  return company.attachmentsApproved === true;
}

async function isPublishedCompanyImage(companyId: string, fileRecord: { kind: string }): Promise<boolean> {
  if (fileRecord.kind !== "image") return false;
  const deal = await prisma.deal.findFirst({
    where: {
      companyId,
      published: true,
      company: { removedAt: null },
    },
  });
  return Boolean(deal);
}

/** Ver / descargar: usuarios con permiso, o imágenes de empresas publicadas en marketplace (sin login). */
export async function GET(req: Request, { params }: Params) {
  const { id: companyId, fileId } = await params;
  if (!companyId || !fileId) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  const fileRecord = await prisma.companyFile.findFirst({
    where: { id: fileId, companyId },
  });
  if (!fileRecord) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const userId = await getUserIdFromRequest(req);
  let allowed = false;
  if (userId) {
    allowed = await canAccessCompanyFiles(companyId, userId);
  }
  if (!allowed) {
    allowed = await isPublishedCompanyImage(companyId, fileRecord);
  }
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const absolutePath = path.join(process.cwd(), "data", "company-files", fileRecord.storagePath);
  let buffer: Buffer;
  try {
    buffer = await readFile(absolutePath);
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en el servidor" }, { status: 404 });
  }

  const isImage = (fileRecord.mimeType ?? "").startsWith("image/");
  const safeName = fileRecord.name.replace(/"/g, "%22");
  const disposition = isImage
    ? `inline; filename="${safeName}"`
    : `attachment; filename="${safeName}"`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": fileRecord.mimeType ?? "application/octet-stream",
      "Content-Disposition": disposition,
      "Content-Length": String(buffer.length),
      ...(isImage ? { "Cache-Control": "public, max-age=3600" } : {}),
    },
  });
}

/** Eliminar archivo (solo propietario o admin). */
export async function DELETE(_req: Request, { params }: Params) {
  const userId = await getUserIdFromRequest(_req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId, fileId } = await params;
  if (!companyId || !fileId) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  if (!(await canOwnerEditCompanyListing(companyId, userId))) {
    return NextResponse.json(
      {
        error:
          "No puedes eliminar archivos: el proyecto está publicado o no tienes permiso.",
      },
      { status: 403 }
    );
  }

  const fileRecord = await prisma.companyFile.findFirst({
    where: { id: fileId, companyId },
  });
  if (!fileRecord) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  await prisma.companyFile.delete({ where: { id: fileId } });

  const absolutePath = path.join(process.cwd(), "data", "company-files", fileRecord.storagePath);
  try {
    await unlink(absolutePath);
  } catch {
    /* archivo ya ausente */
  }

  return NextResponse.json({ ok: true });
}
