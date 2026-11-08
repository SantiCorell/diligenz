import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const updated = await prisma.clientService.updateMany({
    where: { id, userId: session.user.id, status: "PROPOSAL" },
    data: { status: "IN_PROGRESS", acceptedAt: new Date() },
  });
  if (updated.count !== 1) {
    return NextResponse.json({ error: "Esta propuesta ya no se puede aceptar." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
