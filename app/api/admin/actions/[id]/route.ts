import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status;
  if (!["PENDING", "MANAGED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
  }

  const updated = await prisma.userCompanyInterest.updateMany({
    where: { id, type: "REQUEST_INFO" },
    data: { status: status as "PENDING" | "MANAGED" | "REJECTED" },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status });
}
