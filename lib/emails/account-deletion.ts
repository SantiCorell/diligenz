import type { UserRole } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { ADMIN_ROLE_LABELS } from "@/lib/user-admin-ui";
import { appBaseUrl, buildEmailLayout, buildEmailText, escapeHtml } from "./layout";

/**
 * Mismo buzón interno que el aviso de un registro nuevo:
 * REGISTER_NOTIFY_EMAIL, si no MANDATO_NOTIFY_EMAIL, si no info@diligenz.es.
 */
export function getAccountDeletionNotifyEmail(): string {
  return (
    process.env.REGISTER_NOTIFY_EMAIL?.trim() ||
    process.env.MANDATO_NOTIFY_EMAIL?.trim() ||
    "info@diligenz.es"
  );
}

export const ACCOUNT_DELETION_REQUEST_SUBJECT_PREFIX = "Solicitud de eliminación de cuenta";

export async function sendAccountDeletionRequestInternalEmail(opts: {
  userId: string;
  email: string;
  name?: string | null;
  role: UserRole;
}): Promise<boolean> {
  const to = getAccountDeletionNotifyEmail();
  const displayName = opts.name?.trim() || opts.email;
  const roleLabel = ADMIN_ROLE_LABELS[opts.role] ?? opts.role;
  const panelUrl = `${appBaseUrl()}/admin/users`;
  const subject = `${ACCOUNT_DELETION_REQUEST_SUBJECT_PREFIX} — ${displayName}`;

  const text = buildEmailText({
    title: "Solicitud de eliminación de cuenta",
    paragraphs: [
      `${displayName} (${opts.email}) ha solicitado la eliminación de su cuenta.`,
      `Nombre: ${displayName}`,
      `Email: ${opts.email}`,
      `Id de usuario: ${opts.userId}`,
      `Rol: ${roleLabel}`,
      "La cuenta no se ha eliminado. La solicitud está pendiente en el panel de usuarios. El correo al cliente se envía solo cuando un administrador confirma la baja.",
    ],
    cta: { label: "Ver usuarios", href: panelUrl },
  });

  const html = buildEmailLayout({
    preheader: `${opts.email} ha solicitado eliminar su cuenta.`,
    title: "Solicitud de eliminación de cuenta",
    subtitle: "Un usuario ha pedido la baja. La cuenta sigue activa.",
    paragraphs: [
      `<strong style="color:#171d2b;">${escapeHtml(displayName)}</strong> (${escapeHtml(opts.email)}) ha solicitado la eliminación de su cuenta.`,
      `Nombre: <strong style="color:#171d2b;">${escapeHtml(displayName)}</strong><br>Email: <strong style="color:#171d2b;">${escapeHtml(opts.email)}</strong><br>Id de usuario: <strong style="color:#171d2b;">${escapeHtml(opts.userId)}</strong><br>Rol: <strong style="color:#171d2b;">${escapeHtml(roleLabel)}</strong>`,
      "La cuenta no se ha eliminado. La solicitud está pendiente en el panel de usuarios. El correo al cliente se envía solo cuando un administrador confirma la baja.",
    ],
    cta: { label: "Ver usuarios", href: panelUrl },
    footerNote: "Aviso interno de Diligenz. El cliente aún no ha recibido el correo de baja.",
  });

  return sendEmail({ to, subject, text, html });
}

export const ACCOUNT_DELETED_SUBJECT = "Tu cuenta en Diligenz ha sido eliminada";

export async function sendAccountDeletedEmail(opts: {
  to: string;
  name?: string | null;
}): Promise<boolean> {
  const firstName = opts.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : "Hola,";

  const text = buildEmailText({
    title: "Tu cuenta ha sido eliminada",
    greeting,
    paragraphs: [
      "Te confirmamos que tu cuenta en Diligenz ha sido eliminada.",
      "A partir de ahora no podrás iniciar sesión con este acceso.",
      "Si no has solicitado esta baja o crees que se trata de un error, escríbenos a info@diligenz.es.",
    ],
  });

  const html = buildEmailLayout({
    preheader: "Tu cuenta en Diligenz ha sido eliminada.",
    title: "Tu cuenta ha sido eliminada",
    greeting,
    paragraphs: [
      "Te confirmamos que tu cuenta en Diligenz ha sido eliminada.",
      "A partir de ahora no podrás iniciar sesión con este acceso.",
      `Si no has solicitado esta baja o crees que se trata de un error, escríbenos a <a href="mailto:info@diligenz.es" style="color:#9146ff;text-decoration:none;">info@diligenz.es</a>.`,
    ],
    footerNote: "Correo automático enviado al confirmar la eliminación de la cuenta.",
  });

  return sendEmail({
    to: opts.to,
    subject: ACCOUNT_DELETED_SUBJECT,
    text,
    html,
  });
}
