import {
  buildEmailLayout,
  buildEmailText,
  appBaseUrl,
  escapeHtml,
} from "@/lib/emails/layout";

export const ADMIN_EMAIL_TEMPLATE_IDS = [
  "recontacto_sin_respuesta",
  "seguimiento_general",
  "recordatorio_documentacion",
  "invitacion_registro",
  "seguimiento_valoracion",
  "proximos_pasos_vendedor",
] as const;

export type AdminEmailTemplateId = (typeof ADMIN_EMAIL_TEMPLATE_IDS)[number];

export const ADMIN_EMAIL_TEMPLATE_LABELS: Record<AdminEmailTemplateId, string> = {
  recontacto_sin_respuesta: "Recontacto — no localizados",
  seguimiento_general: "Seguimiento general",
  recordatorio_documentacion: "Recordatorio de documentación",
  invitacion_registro: "Invitación a crear cuenta",
  seguimiento_valoracion: "Seguimiento tras valoración",
  proximos_pasos_vendedor: "Próximos pasos (vendedor)",
};

export function isAdminEmailTemplateId(v: string): v is AdminEmailTemplateId {
  return ADMIN_EMAIL_TEMPLATE_IDS.includes(v as AdminEmailTemplateId);
}

export type AdminEmailTemplateContext = {
  recipientName?: string | null;
  recipientEmail: string;
};

export type AdminEmailOverrides = {
  subject?: string | null;
  bodyText?: string | null;
};

type TemplateLayout = {
  preheader?: string;
  title: string;
  subtitle?: string;
  defaultSubject: string;
  defaultBodyParagraphs: string[];
  highlightHtml?: string;
  cta?: { label: string; href: string };
  afterCtaParagraphs?: string[];
};

function greeting(ctx: AdminEmailTemplateContext): string {
  const name = ctx.recipientName?.trim();
  return name ? `Hola ${name},` : "Hola,";
}

function bodyTextFromParagraphs(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

function paragraphsFromBodyText(bodyText: string, fallback: string[]): string[] {
  const parsed = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function htmlParagraphs(paragraphs: string[]): string[] {
  return paragraphs.map((p) => escapeHtml(p));
}

function getTemplateLayout(
  templateId: AdminEmailTemplateId,
  ctx: AdminEmailTemplateContext
): TemplateLayout {
  const baseUrl = appBaseUrl();
  const contactUrl = `${baseUrl}/contact`;

  switch (templateId) {
    case "recontacto_sin_respuesta":
      return {
        defaultSubject: "Intentamos contactarte · Diligenz",
        preheader: "No hemos podido localizarte — ¿nos llamas o concertamos una cita?",
        title: "Queremos hablar contigo",
        subtitle: "Hemos intentado contactarte sin éxito",
        defaultBodyParagraphs: [
          "Desde Diligenz hemos intentado ponernos en contacto contigo en relación con tu interés en nuestra plataforma, pero aún no hemos podido hablar contigo.",
          "Nos gustaría resolver tus dudas y avanzar contigo con la confidencialidad y el rigor que merece una operación de compraventa de empresas.",
          "¿Nos ayudas? Llámanos, responde a este correo con tu teléfono y la franja horaria que te venga mejor, o escríbenos desde nuestra web y concertamos una cita.",
        ],
        highlightHtml: `<strong style="color:#171d2b;">¿Cómo contactarnos?</strong><br><br>
📞 Responde a este email con tu teléfono<br>
✉️ <a href="mailto:info@diligenz.es" style="color:#6b2fd4;text-decoration:none;">info@diligenz.es</a><br>
🌐 <a href="${contactUrl}" style="color:#6b2fd4;text-decoration:none;">Formulario de contacto</a>`,
        cta: { label: "Contactar con Diligenz", href: contactUrl },
        afterCtaParagraphs: ["Quedamos a la espera de tu respuesta. Un saludo cordial,"],
      };

    case "seguimiento_general":
      return {
        defaultSubject: "Seguimiento desde Diligenz",
        preheader: "Te escribimos desde el equipo de Diligenz.",
        title: "Seguimiento",
        defaultBodyParagraphs: [
          "Te escribimos desde Diligenz para hacer seguimiento de tu contacto con nosotros.",
          "Si tienes cualquier duda sobre el proceso de compraventa, la documentación o los próximos pasos, responde a este correo y te ayudamos encantados.",
        ],
        cta: { label: "Ir a Diligenz", href: baseUrl },
        afterCtaParagraphs: ["Gracias por confiar en nosotros."],
      };

    case "recordatorio_documentacion":
      return {
        defaultSubject: "Documentación pendiente · Diligenz",
        preheader: "Te recordamos la documentación pendiente en tu perfil.",
        title: "Documentación pendiente",
        defaultBodyParagraphs: [
          "Para avanzar con tu operación en Diligenz, necesitamos que completes la documentación pendiente en tu perfil (DNI, mandato o acuerdos según tu perfil).",
          "Puedes subirla desde tu panel de usuario. Si tienes algún problema técnico, escríbenos y lo resolvemos contigo.",
        ],
        highlightHtml:
          "<strong>¿Qué hacer?</strong><br>Accede a tu perfil, revisa los apartados marcados como pendientes y sube los documentos solicitados.",
        cta: { label: "Acceder a mi perfil", href: `${baseUrl}/dashboard/profile` },
      };

    case "invitacion_registro":
      return {
        defaultSubject: "Completa tu registro en Diligenz",
        preheader: "Crea tu cuenta en Diligenz para continuar.",
        title: "Te invitamos a unirte a Diligenz",
        defaultBodyParagraphs: [
          "Hemos recibido tu interés en Diligenz. Para gestionar tu valoración, solicitudes o documentación de forma segura, te recomendamos crear tu cuenta gratuita.",
          "Con tu perfil podrás hacer seguimiento de todo el proceso desde un único lugar.",
        ],
        cta: { label: "Crear cuenta", href: `${baseUrl}/register` },
        afterCtaParagraphs: [
          "Si ya tienes cuenta, inicia sesión con el mismo email con el que nos contactaste.",
        ],
      };

    case "seguimiento_valoracion":
      return {
        defaultSubject: "Tu valoración en Diligenz",
        preheader: "Seguimiento de la valoración de tu empresa.",
        title: "Seguimiento de tu valoración",
        defaultBodyParagraphs: [
          "Gracias por valorar tu empresa con Diligenz. Queríamos ponernos en contacto contigo para conocer tus objetivos y explicarte los siguientes pasos si deseas vender o recibir asesoramiento.",
          "Si prefieres, responde a este correo indicando tu disponibilidad para una llamada breve.",
        ],
        cta: { label: "Ver más sobre vender", href: `${baseUrl}/sell` },
      };

    case "proximos_pasos_vendedor":
      return {
        defaultSubject: "Próximos pasos como vendedor · Diligenz",
        preheader: "Te guiamos en los próximos pasos para vender tu empresa.",
        title: "Próximos pasos",
        defaultBodyParagraphs: [
          "Desde Diligenz queremos ayudarte a preparar la venta de tu empresa con el máximo rigor y confidencialidad.",
          "Los pasos habituales son: completar tu perfil y documentación, firmar el mandato de venta y preparar la ficha del negocio para compradores cualificados.",
        ],
        highlightHtml:
          "<strong>¿Necesitas ayuda?</strong><br>Responde a este correo o llámanos y te acompañamos en el proceso.",
        cta: { label: "Ir a mi panel", href: `${baseUrl}/dashboard` },
      };
  }
}

export function getDefaultBodyText(templateId: AdminEmailTemplateId): string {
  const layout = getTemplateLayout(templateId, { recipientEmail: "" });
  return bodyTextFromParagraphs(layout.defaultBodyParagraphs);
}

export function buildAdminOutreachEmail(
  templateId: AdminEmailTemplateId,
  ctx: AdminEmailTemplateContext,
  overrides?: AdminEmailOverrides
): { subject: string; html: string; text: string; bodyText: string } {
  const layout = getTemplateLayout(templateId, ctx);
  const greet = greeting(ctx);

  const paragraphs = paragraphsFromBodyText(
    overrides?.bodyText?.trim() ?? "",
    layout.defaultBodyParagraphs
  );
  const bodyText = bodyTextFromParagraphs(paragraphs);
  const subject =
    overrides?.subject?.trim() || layout.defaultSubject;

  const html = buildEmailLayout({
    preheader: layout.preheader,
    title: layout.title,
    subtitle: layout.subtitle,
    greeting: greet,
    paragraphs: htmlParagraphs(paragraphs),
    highlightHtml: layout.highlightHtml,
    cta: layout.cta,
    afterCtaParagraphs: layout.afterCtaParagraphs
      ? htmlParagraphs(layout.afterCtaParagraphs)
      : undefined,
  });

  const text = buildEmailText({
    title: layout.title,
    greeting: greet,
    paragraphs,
    highlight: layout.highlightHtml
      ? layout.highlightHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : undefined,
    cta: layout.cta,
    afterCtaParagraphs: layout.afterCtaParagraphs,
  });

  return { subject, html, text, bodyText };
}
