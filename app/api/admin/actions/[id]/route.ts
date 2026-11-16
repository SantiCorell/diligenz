import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { logUserActivity } from "@/lib/user-activity";
import {
  PIPELINE_STATUSES,
  normalizeRequestStatus,
  type PipelineStatus,
} from "@/lib/info-request-pipeline";

type Params = { params: Promise<{ id: string }> };

const ALLOWED = new Set<string>(PIPELINE_STATUSES);

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const hasStatus = typeof body.status === "string";
  const hasNote = typeof body.internalNote === "string";

  if (!hasStatus && !hasNote) {
    return NextResponse.json({ error: "Nada que guardar" }, { status: 400 });
  }
  if (hasStatus && !ALLOWED.has(body.status)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
  }

  const interest = await prisma.userCompanyInterest.findFirst({
    where: { id, type: "REQUEST_INFO" },
  });
  if (!interest) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const previousStatus = normalizeRequestStatus(interest.status);
  const nextStatus = (hasStatus ? body.status : previousStatus) as PipelineStatus;

  await prisma.userCompanyInterest.update({
    where: { id },
    data: {
      ...(hasStatus ? { status: nextStatus, statusUpdatedAt: new Date() } : {}),
      ...(hasNote ? { internalNote: body.internalNote.trim() || null } : {}),
    },
  });

  if (hasStatus && previousStatus !== nextStatus) {
    await logUserActivity({
      userId: interest.userId,
      type: "INFO_REQUEST_STATUS_CHANGED",
      companyId: interest.companyId,
      metadata: {
        from: previousStatus,
        to: nextStatus,
        adminId: session.userId,
        manual: true,
      },
    });
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
