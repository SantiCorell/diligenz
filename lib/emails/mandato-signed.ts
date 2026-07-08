import { sendEmail } from "@/lib/email";
import { getMandatoNotifyEmail } from "@/lib/email-config";
import { buildEmailLayout, buildEmailText } from "@/lib/emails/layout";

export type MandatoEmailAttachment = {
  filename: string;
  content: Buffer;
};

export async function sendMandatoSignedEmails(opts: {
  clientEmail: string;
  clientName: string;
  documentTitle: string;
  signedAt: Date;
  userSubject: string;
  internalSubject: string;
  internalSummaryHtml: string;
  internalSummaryText: string;
  attachments: MandatoEmailAttachment[];
}): Promise<{ userSent: boolean; internalSent: boolean }> {
  const signedAtLabel = opts.signedAt.toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
  });
  const notifyEmail = getMandatoNotifyEmail();

  let userSent = false;
  let internalSent = false;

  const userHtml = buildEmailLayout({
    preheader: `Copia de tu ${opts.documentTitle} firmado en Diligenz`,
    title: opts.userSubject.replace(/ — Diligenz$/, ""),
    subtitle: `Firmado el ${signedAtLabel}`,
    greeting: `Hola ${opts.clientName},`,
    paragraphs: [
      `Adjuntamos copia del <strong>${opts.documentTitle}</strong> que has firmado electrónicamente en Diligenz.`,
      "Conserva este documento para tu registro. Si tienes dudas, responde a este correo o escríbenos a info@diligenz.es.",
    ],
    footerNote: "Este mensaje se ha generado automáticamente tras tu firma en diligenz.es.",
  });

  const userText = buildEmailText({
    title: opts.userSubject,
    greeting: `Hola ${opts.clientName},`,
    paragraphs: [
      `Adjuntamos copia del ${opts.documentTitle} firmado el ${signedAtLabel}.`,
      "Conserva este documento para tu registro.",
    ],
  });

  try {
    userSent = await sendEmail({
      to: opts.clientEmail,
      subject: opts.userSubject,
      text: userText,
      html: userHtml,
      attachments: opts.attachments,
    });
  } catch (e) {
    console.error("[mandato-email] correo al cliente error:", e);
  }

  if (opts.clientEmail.toLowerCase() === notifyEmail.toLowerCase()) {
    internalSent = userSent;
    return { userSent, internalSent };
  }

  const internalHtml = buildEmailLayout({
    preheader: `Nuevo ${opts.documentTitle} firmado en Diligenz`,
    title: opts.internalSubject,
    subtitle: `Fecha de firma: ${signedAtLabel}`,
    paragraphs: ["Se ha registrado una nueva firma en la plataforma."],
    highlightHtml: opts.internalSummaryHtml,
    footerNote: "Notificación interna automática de Diligenz.",
  });

  const internalText = buildEmailText({
    title: opts.internalSubject,
    paragraphs: [
      "Se ha firmado un nuevo documento en Diligenz.",
      opts.internalSummaryText,
      `Fecha de firma: ${signedAtLabel}`,
    ],
  });

  try {
    internalSent = await sendEmail({
      to: notifyEmail,
      subject: opts.internalSubject,
      text: internalText,
      html: internalHtml,
      attachments: opts.attachments,
    });
  } catch (e) {
    console.error("[mandato-email] correo interno error:", e);
  }

  return { userSent, internalSent };
}
