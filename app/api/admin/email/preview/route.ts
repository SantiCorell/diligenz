import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest } from "@/lib/session";
import {
  ADMIN_EMAIL_TEMPLATE_IDS,
  buildAdminOutreachEmail,
  isAdminEmailTemplateEditable,
  isAdminEmailTemplateId,
} from "@/lib/emails/admin-outreach-templates";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template") ?? "";
  const recipientEmail = (searchParams.get("email") ?? "").trim();
  const recipientName = (searchParams.get("name") ?? "").trim() || null;
  const subjectOverride = searchParams.get("subject")?.trim() || null;
  const bodyTextOverride = searchParams.get("bodyText")?.trim() || null;

  if (!isAdminEmailTemplateId(template)) {
    return NextResponse.json(
      {
        error: "Plantilla no válida.",
        templates: ADMIN_EMAIL_TEMPLATE_IDS,
      },
      { status: 400 }
    );
  }

  if (!recipientEmail) {
    return NextResponse.json({ error: "Indica el email del destinatario." }, { status: 400 });
  }

  const built = buildAdminOutreachEmail(
    template,
    { recipientEmail, recipientName },
    isAdminEmailTemplateEditable(template)
      ? { subject: subjectOverride, bodyText: bodyTextOverride }
      : undefined
  );

  if (isAdminEmailTemplateEditable(template) && (!built.subject || !built.bodyText.trim())) {
    return NextResponse.json(
      { error: "Indica asunto y mensaje para el correo libre." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    template,
    subject: built.subject,
    bodyText: isAdminEmailTemplateEditable(template) ? built.bodyText : undefined,
    html: built.html,
    text: built.text,
  });
}
