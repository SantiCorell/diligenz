import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { logUserActivity } from "@/lib/user-activity";
import { normalizeRequestStatus } from "@/lib/info-request-pipeline";
import { sendInfoRequestAdvanceEmails } from "@/lib/emails/info-request-advance";
import { resolveCompanyDisplayName } from "@/lib/emails/resolve-company-name";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const decision = body.decision === "decline" ? "decline" : body.decision === "advance" ? "advance" : null;
  if (!decision) {
    return NextResponse.json({ error: "Decisión no válida" }, { status: 400 });
  }

  const interest = await prisma.userCompanyInterest.findFirst({
    where: { id, userId: session.userId, type: "REQUEST_INFO" },
  });
  if (!interest) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  if (normalizeRequestStatus(interest.status) !== "TEASER") {
    return NextResponse.json(
      { error: "Esta solicitud ya no está pendiente de tu decisión sobre el teaser." },
      { status: 409 }
    );
  }

  const nextStatus = decision === "advance" ? "CONVERSATIONS" : "REJECTED";
  await prisma.userCompanyInterest.update({
    where: { id },
    data: { status: nextStatus, statusUpdatedAt: new Date() },
  });
  await logUserActivity({
    userId: session.userId,
    type: "INFO_REQUEST_STATUS_CHANGED",
    companyId: interest.companyId,
    metadata: { from: "TEASER", to: nextStatus, byBuyer: true },
  });

  if (decision === "advance") {
    try {
      const companyName = await resolveCompanyDisplayName(interest.companyId);
      await sendInfoRequestAdvanceEmails({
        buyerEmail: session.user.email,
        buyerName: session.user.name,
        companyName,
        companyId: interest.companyId,
      });
    } catch (error) {
      console.error("[info-request advance] email:", error);
    }
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
