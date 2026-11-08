import { sendEmail } from "@/lib/email";
import { appBaseUrl, buildEmailLayout, buildEmailText, escapeHtml } from "./layout";

type ReminderKind = "nda" | "contact";

export async function sendInfoRequestReminder(opts: {
  kind: ReminderKind;
  to: string;
  buyerName?: string | null;
  companyName: string;
  agentName?: string | null;
  bookingUrl?: string | null;
}): Promise<boolean> {
  const baseUrl = appBaseUrl();
  const ndaUrl = `${baseUrl}/dashboard/nda`;
  const firstName = opts.buyerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : "Hola,";
  const company = opts.companyName.trim() || "la empresa";
  const companyHtml = escapeHtml(company);
  const agent = opts.agentName?.trim();
  const agentLabel = agent ? escapeHtml(agent) : "tu gestor";
  const booking = opts.bookingUrl?.trim() || "";

  const bookingLine = booking
    ? `Si tienes alguna duda, ponte en contacto con ${agent ? agent : "tu gestor"} y reserva una llamada: ${booking}`
    : `Si tienes alguna duda, ponte en contacto con ${agent ? agent : "tu gestor"}.`;
  const bookingHtml = booking
    ? `Si tienes alguna duda, ponte en contacto con ${agentLabel} y <a href="${escapeHtml(booking)}" style="color:#6b2fd4;font-weight:bold;">reserva una llamada</a>.`
    : `Si tienes alguna duda, ponte en contacto con ${agentLabel}.`;

  if (opts.kind === "nda") {
    return sendEmail({
      to: opts.to,
      subject: `Firma el NDA para recibir información de ${company} — Diligenz`,
      text: buildEmailText({
        title: "Firma el NDA para continuar",
        greeting,
        paragraphs: [
          `Hemos visto que has solicitado información sobre ${company}.`,
          "Para poder enviarte esa información, firma el NDA en tu panel.",
          bookingLine,
        ],
        cta: { label: "Firmar el NDA", href: ndaUrl },
      }),
      html: buildEmailLayout({
        preheader: `Firma el NDA para recibir información de ${company}.`,
        title: "Firma el NDA para continuar",
        greeting,
        paragraphs: [
          `Hemos visto que has solicitado información sobre <strong style="color:#171d2b;">${companyHtml}</strong>.`,
          "Para poder enviarte esa información, firma el NDA en tu panel.",
        ],
        cta: { label: "Firmar el NDA", href: ndaUrl },
        afterCtaParagraphs: [bookingHtml],
        footerNote: "Has recibido este correo porque solicitaste información de una empresa en Diligenz.",
      }),
    });
  }

  const contactIntro = `Para poder enviarte más información sobre ${company} necesitamos ponernos en contacto contigo y no lo hemos conseguido.`;
  const contactAsk = booking
    ? `Indícanos tu disponibilidad respondiendo a este correo, o reserva una llamada con ${agent ? agent : "tu gestor"}.`
    : "Indícanos tu disponibilidad respondiendo a este correo.";

  return sendEmail({
    to: opts.to,
    subject: `Necesitamos hablar contigo sobre ${company} — Diligenz`,
    text: buildEmailText({
      title: "No hemos podido contactarte",
      greeting,
      paragraphs: [contactIntro, contactAsk],
      cta: booking
        ? { label: "Reservar una llamada", href: booking }
        : { label: "Escribir a Diligenz", href: "mailto:info@diligenz.es" },
    }),
    html: buildEmailLayout({
      preheader: `Necesitamos ponernos en contacto contigo sobre ${company}.`,
      title: "No hemos podido contactarte",
      greeting,
      paragraphs: [
        `Para poder enviarte más información sobre <strong style="color:#171d2b;">${companyHtml}</strong> necesitamos ponernos en contacto contigo y no lo hemos conseguido.`,
        contactAsk,
      ],
      cta: booking
        ? { label: "Reservar una llamada", href: booking }
        : { label: "Escribir a Diligenz", href: "mailto:info@diligenz.es" },
      footerNote: "Has recibido este correo porque solicitaste información de una empresa en Diligenz.",
    }),
  });
}
