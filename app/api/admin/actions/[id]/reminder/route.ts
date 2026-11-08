import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { publicListingName } from "@/lib/company-display-names";
import { isEmailConfigured } from "@/lib/email";
import { normalizeRequestStatus } from "@/lib/info-request-pipeline";
import { sendInfoRequestReminder } from "@/lib/emails/info-request-reminder";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const interest = await prisma.userCompanyInterest.findFirst({
    where: { id, type: "REQUEST_INFO" },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          assignedAgent: { select: { name: true, bookingUrl: true, active: true } },
        },
      },
    },
  });
  if (!interest) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const status = normalizeRequestStatus(interest.status);
  const kind = status === "PENDING_NDA" ? "nda" : status === "IN_REVIEW" ? "contact" : null;
  if (!kind) {
    return NextResponse.json(
      { error: "El recordatorio solo está disponible en Pendiente NDA y En revisión." },
      { status: 400 }
    );
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "El correo no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: interest.companyId },
    select: {
      name: true,
      deals: { orderBy: { createdAt: "desc" }, take: 1, select: { title: true } },
    },
  });
  const companyName = company
    ? publicListingName(company.deals[0]?.title, company.name)
    : "la empresa";

  let agentName = interest.user.assignedAgent?.active
    ? interest.user.assignedAgent.name
    : null;
  let bookingUrl = interest.user.assignedAgent?.active
    ? interest.user.assignedAgent.bookingUrl
    : null;
  if (!bookingUrl) {
    const fallback = await prisma.agent.findFirst({
      where: { active: true, bookingUrl: { not: null } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: { name: true, bookingUrl: true },
    });
    bookingUrl = fallback?.bookingUrl ?? null;
    if (!agentName) agentName = fallback?.name ?? null;
  }

  try {
    const sent = await sendInfoRequestReminder({
      kind,
      to: interest.user.email,
      buyerName: interest.user.name,
      companyName,
      agentName,
      bookingUrl,
    });
    if (!sent) {
      return NextResponse.json(
        { error: "No se ha podido enviar el correo." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error(
      "[actions/reminder]",
      error instanceof Error ? error.message : "failed"
    );
    return NextResponse.json(
      { error: "El correo no se ha podido enviar. Inténtalo de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    kind,
    to: interest.user.email,
  });
}
