import { NextResponse } from "next/server";
import { canOwnerEditCompanyListing } from "@/lib/company-owner-edit";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** Marca una imagen como portada (sortOrder 0, el resto ordenados detrás). */
export async function POST(req: Request, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId } = await params;
  if (!companyId) {
    return NextResponse.json({ error: "Empresa no indicada" }, { status: 400 });
  }

  if (!(await canOwnerEditCompanyListing(companyId, userId))) {
    return NextResponse.json(
      {
        error:
          "No puedes cambiar la portada: el proyecto está publicado o no tienes permiso.",
      },
      { status: 403 }
    );
  }

  let fileId: string;
  try {
    const body = await req.json();
    fileId = typeof body?.fileId === "string" ? body.fileId : "";
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!fileId) {
    return NextResponse.json({ error: "Falta fileId" }, { status: 400 });
  }

  const cover = await prisma.companyFile.findFirst({
    where: { id: fileId, companyId, kind: "image" },
  });
  if (!cover) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  const others = await prisma.companyFile.findMany({
    where: { companyId, kind: "image", NOT: { id: fileId } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const orderedIds = [fileId, ...others.map((o) => o.id)];
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.companyFile.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
