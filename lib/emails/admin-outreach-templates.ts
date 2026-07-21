import { buildEmailLayout, buildEmailText, appBaseUrl } from "@/lib/emails/layout";

export const ADMIN_EMAIL_TEMPLATE_IDS = [
  "seguimiento_general",
  "recordatorio_documentacion",
  "invitacion_registro",
  "seguimiento_valoracion",
  "proximos_pasos_vendedor",
] as const;

export type AdminEmailTemplateId = (typeof ADMIN_EMAIL_TEMPLATE_IDS)[number];

export const ADMIN_EMAIL_TEMPLATE_LABELS: Record<AdminEmailTemplateId, string> = {
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

function greeting(ctx: AdminEmailTemplateContext): string {
  const name = ctx.recipientName?.trim();
  return name ? `Hola ${name},` : "Hola,";
}

export function buildAdminOutreachEmail(
  templateId: AdminEmailTemplateId,
  ctx: AdminEmailTemplateContext
): { subject: string; html: string; text: string } {
  const baseUrl = appBaseUrl();
  const greet = greeting(ctx);

  switch (templateId) {
    case "seguimiento_general":
      return {
        subject: "Seguimiento desde Diligenz",
        html: buildEmailLayout({
          preheader: "Te escribimos desde el equipo de Diligenz.",
          title: "Seguimiento",
          greeting: greet,
          paragraphs: [
            "Te escribimos desde <strong>Diligenz</strong> para hacer seguimiento de tu contacto con nosotros.",
            "Si tienes cualquier duda sobre el proceso de compraventa, la documentación o los próximos pasos, responde a este correo y te ayudamos encantados.",
          ],
          cta: { label: "Ir a Diligenz", href: baseUrl },
          afterCtaParagraphs: [
            "Gracias por confiar en nosotros.",
          ],
        }),
        text: buildEmailText({
          title: "Seguimiento desde Diligenz",
          greeting: greet,
          paragraphs: [
            "Te escribimos desde Diligenz para hacer seguimiento de tu contacto con nosotros.",
            "Si tienes cualquier duda, responde a este correo y te ayudamos.",
          ],
          cta: { label: "Ir a Diligenz", href: baseUrl },
        }),
      };

    case "recordatorio_documentacion":
      return {
        subject: "Documentación pendiente · Diligenz",
        html: buildEmailLayout({
          preheader: "Te recordamos la documentación pendiente en tu perfil.",
          title: "Documentación pendiente",
          greeting: greet,
          paragraphs: [
            "Para avanzar con tu operación en <strong>Diligenz</strong>, necesitamos que completes la documentación pendiente en tu perfil (DNI, mandato o acuerdos según tu perfil).",
            "Puedes subirla desde tu panel de usuario. Si tienes algún problema técnico, escríbenos y lo resolvemos contigo.",
          ],
          highlightHtml:
            "<strong>¿Qué hacer?</strong><br>Accede a tu perfil, revisa los apartados marcados como pendientes y sube los documentos solicitados.",
          cta: { label: "Acceder a mi perfil", href: `${baseUrl}/dashboard/profile` },
        }),
        text: buildEmailText({
          title: "Documentación pendiente · Diligenz",
          greeting: greet,
          paragraphs: [
            "Para avanzar con tu operación en Diligenz, necesitamos que completes la documentación pendiente en tu perfil.",
            "Accede a tu panel y sube los documentos solicitados.",
          ],
          cta: { label: "Acceder a mi perfil", href: `${baseUrl}/dashboard/profile` },
        }),
      };

    case "invitacion_registro":
      return {
        subject: "Completa tu registro en Diligenz",
        html: buildEmailLayout({
          preheader: "Crea tu cuenta en Diligenz para continuar.",
          title: "Te invitamos a unirte a Diligenz",
          greeting: greet,
          paragraphs: [
            "Hemos recibido tu interés en <strong>Diligenz</strong>. Para gestionar tu valoración, solicitudes o documentación de forma segura, te recomendamos crear tu cuenta gratuita.",
            "Con tu perfil podrás hacer seguimiento de todo el proceso desde un único lugar.",
          ],
          cta: { label: "Crear cuenta", href: `${baseUrl}/register` },
          afterCtaParagraphs: [
            "Si ya tienes cuenta, inicia sesión con el mismo email con el que nos contactaste.",
          ],
        }),
        text: buildEmailText({
          title: "Te invitamos a unirte a Diligenz",
          greeting: greet,
          paragraphs: [
            "Hemos recibido tu interés en Diligenz. Crea tu cuenta gratuita para gestionar tu valoración y documentación.",
            "Si ya tienes cuenta, inicia sesión con el mismo email.",
          ],
          cta: { label: "Crear cuenta", href: `${baseUrl}/register` },
        }),
      };

    case "seguimiento_valoracion":
      return {
        subject: "Tu valoración en Diligenz",
        html: buildEmailLayout({
          preheader: "Seguimiento de la valoración de tu empresa.",
          title: "Seguimiento de tu valoración",
          greeting: greet,
          paragraphs: [
            "Gracias por valorar tu empresa con <strong>Diligenz</strong>. Queríamos ponernos en contacto contigo para conocer tus objetivos y explicarte los siguientes pasos si deseas vender o recibir asesoramiento.",
            "Si prefieres, responde a este correo indicando tu disponibilidad para una llamada breve.",
          ],
          cta: { label: "Ver más sobre vender", href: `${baseUrl}/sell` },
        }),
        text: buildEmailText({
          title: "Seguimiento de tu valoración",
          greeting: greet,
          paragraphs: [
            "Gracias por valorar tu empresa con Diligenz. Queríamos ponernos en contacto para explicarte los siguientes pasos.",
            "Responde a este correo si prefieres agendar una llamada.",
          ],
          cta: { label: "Ver más sobre vender", href: `${baseUrl}/sell` },
        }),
      };

    case "proximos_pasos_vendedor":
      return {
        subject: "Próximos pasos como vendedor · Diligenz",
        html: buildEmailLayout({
          preheader: "Te guiamos en los próximos pasos para vender tu empresa.",
          title: "Próximos pasos",
          greeting: greet,
          paragraphs: [
            "Desde <strong>Diligenz</strong> queremos ayudarte a preparar la venta de tu empresa con el máximo rigor y confidencialidad.",
            "Los pasos habituales son: completar tu perfil y documentación, firmar el mandato de venta y preparar la ficha del negocio para compradores cualificados.",
          ],
          highlightHtml:
            "<strong>¿Necesitas ayuda?</strong><br>Responde a este correo o llámanos y te acompañamos en el proceso.",
          cta: { label: "Ir a mi panel", href: `${baseUrl}/dashboard` },
        }),
        text: buildEmailText({
          title: "Próximos pasos como vendedor · Diligenz",
          greeting: greet,
          paragraphs: [
            "Desde Diligenz queremos ayudarte a preparar la venta de tu empresa.",
            "Completa tu perfil, firma el mandato y prepara la ficha del negocio.",
          ],
          cta: { label: "Ir a mi panel", href: `${baseUrl}/dashboard` },
        }),
      };
  }
}
