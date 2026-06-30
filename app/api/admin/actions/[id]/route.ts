import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { logUserActivity } from "@/lib/user-activity";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status;
  if (!["PENDING", "MANAGED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
  }

  const interest = await prisma.userCompanyInterest.findFirst({
    where: { id, type: "REQUEST_INFO" },
  });

  if (!interest) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const previousStatus = interest.status ?? "PENDING";

  await prisma.userCompanyInterest.update({
    where: { id },
    data: { status: status as "PENDING" | "MANAGED" | "REJECTED" },
  });

  if (previousStatus !== status) {
    await logUserActivity({
      userId: interest.userId,
      type: "INFO_REQUEST_STATUS_CHANGED",
      companyId: interest.companyId,
      metadata: {
        from: previousStatus,
        to: status,
        adminId: session.userId,
      },
    });
  }

  return NextResponse.json({ ok: true, status });
}
