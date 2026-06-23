import { sendEmail } from "@/lib/email";
import { buildEmailLayout, buildEmailText } from "./layout";

export const PASSWORD_RESET_SUBJECT = "Restablece tu contraseña — Diligenz";

export function buildPasswordResetEmailHtml(opts: {
  resetUrl: string;
  name?: string | null;
}): string {
  const firstName = opts.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : "Hola,";

  return buildEmailLayout({
    preheader: "Enlace para elegir una nueva contraseña (válido 1 hora).",
    title: "Restablecer contraseña",
    subtitle: "Solicitud de cambio de acceso a tu cuenta Diligenz.",
    greeting,
    paragraphs: [
      "Hemos recibido una petición para restablecer la contraseña de tu cuenta. Si fuiste tú, pulsa el botón para elegir una nueva.",
      "Por seguridad, el enlace <strong style=\"color:#171d2b;\">caduca en 1 hora</strong> y solo puede usarse una vez.",
    ],
    cta: { label: "Elegir nueva contraseña", href: opts.resetUrl },
    afterCtaParagraphs: [
      "Si no has solicitado este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo la misma.",
      `<span style="font-size:13px;color:#6b7280;">Enlace alternativo:<br><a href="${opts.resetUrl}" style="color:#9146ff;word-break:break-all;">${opts.resetUrl}</a></span>`,
    ],
    footerNote: "Correo automático de seguridad. No compartas este enlace con nadie.",
  });
}

export function buildPasswordResetEmailText(opts: { resetUrl: string; name?: string | null }): string {
  const firstName = opts.name?.trim().split(/\s+/)[0];
  return buildEmailText({
    title: "Restablecer contraseña — Diligenz",
    greeting: firstName ? `Hola ${firstName},` : "Hola,",
    paragraphs: [
      "Hemos recibido una petición para restablecer la contraseña de tu cuenta.",
      "El enlace caduca en 1 hora y solo puede usarse una vez.",
    ],
    cta: { label: "Elegir nueva contraseña", href: opts.resetUrl },
    afterCtaParagraphs: [
      "Si no has solicitado este cambio, ignora este correo.",
    ],
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name?: string | null;
  resetUrl: string;
}): Promise<boolean> {
  return sendEmail({
    to: opts.to,
    subject: PASSWORD_RESET_SUBJECT,
    text: buildPasswordResetEmailText({ resetUrl: opts.resetUrl, name: opts.name }),
    html: buildPasswordResetEmailHtml({ resetUrl: opts.resetUrl, name: opts.name }),
  });
}
