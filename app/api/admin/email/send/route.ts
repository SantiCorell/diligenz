import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { getSessionWithUserFromRequest } from "@/lib/session";
import {
  buildAdminOutreachEmail,
  isAdminEmailTemplateId,
} from "@/lib/emails/admin-outreach-templates";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "SMTP no configurado. Revisa SMTP_HOST, SMTP_USER y SMTP_PASS." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const template = typeof body.template === "string" ? body.template : "";
  const to = typeof body.to === "string" ? body.to.trim() : "";
  const recipientName =
    typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
  const subjectOverride =
    typeof body.subject === "string" && body.subject.trim() ? body.subject.trim() : null;
  const bodyTextOverride =
    typeof body.bodyText === "string" && body.bodyText.trim() ? body.bodyText.trim() : null;

  if (!to || !to.includes("@")) {
    return NextResponse.json({ error: "Email de destino no válido." }, { status: 400 });
  }

  if (!isAdminEmailTemplateId(template)) {
    return NextResponse.json({ error: "Plantilla no válida." }, { status: 400 });
  }

  const built = buildAdminOutreachEmail(
    template,
    { recipientEmail: to, recipientName },
    { subject: subjectOverride, bodyText: bodyTextOverride }
  );

  try {
    const sent = await sendEmail({
      to,
      subject: built.subject,
      text: built.text,
      html: built.html,
    });

    if (!sent) {
      return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, subject: built.subject });
  } catch (err) {
    console.error("[admin/email/send]", err);
    return NextResponse.json({ error: "Error al enviar el correo." }, { status: 500 });
  }
}
