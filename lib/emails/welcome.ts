import { sendEmail } from "@/lib/email";
import {
  WELCOME_EMAIL_SUBJECT,
  buildWelcomeEmailHtml,
  buildWelcomeEmailText,
} from "@/lib/emails/welcome-html";

export type WelcomeRole = "SELLER" | "BUYER" | "PROFESSIONAL";

function appBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.diligenz.es";
  return url.replace(/\/$/, "");
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  role: WelcomeRole;
}): Promise<boolean> {
  const baseUrl = appBaseUrl();

  const sentToUser = await sendEmail({
    to: opts.to,
    subject: WELCOME_EMAIL_SUBJECT,
    text: buildWelcomeEmailText({ name: opts.name, baseUrl }),
    html: buildWelcomeEmailHtml({ name: opts.name, baseUrl }),
  });

  // Aviso interno a info@ para que veas nuevos registros
  const internalEmail =
    process.env.REGISTER_NOTIFY_EMAIL?.trim() ||
    process.env.MANDATO_NOTIFY_EMAIL?.trim() ||
    "info@diligenz.es";

  if (
    internalEmail &&
    internalEmail.toLowerCase() !== opts.to.toLowerCase()
  ) {
    const roleLabel =
      opts.role === "SELLER"
        ? "vendedor"
        : opts.role === "PROFESSIONAL"
          ? "profesional"
          : "comprador";

    try {
      await sendEmail({
        to: internalEmail,
        subject: `Nuevo registro (${roleLabel}) en Diligenz`,
        text: `Se ha registrado un nuevo ${roleLabel} en Diligenz.\n\nNombre: ${
          opts.name || "—"
        }\nEmail: ${opts.to}\nRol: ${opts.role}\n\nPuedes ver el detalle en el panel de administración.`,
      });
    } catch (e) {
      console.error("[welcome] email interno de registro error:", e);
    }
  }

  return sentToUser;
}
