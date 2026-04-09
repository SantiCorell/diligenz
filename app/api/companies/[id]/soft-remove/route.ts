import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** Borrado lógico: marca removedAt/removedById y despublica el deal. Admin o propietario. */
export async function POST(_req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(_req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId } = await params;
  if (!companyId) {
    return NextResponse.json({ error: "Empresa no indicada" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, ownerId: true, removedAt: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }
  if (company.removedAt) {
    return NextResponse.json({ error: "Esta empresa ya fue eliminada" }, { status: 400 });
  }

  const isOwner = company.ownerId === session.userId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.company.update({
      where: { id: companyId },
      data: {
        removedAt: new Date(),
        removedById: session.userId,
      },
    }),
    prisma.deal.updateMany({
      where: { companyId },
      data: { published: false },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
