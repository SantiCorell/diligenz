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

  return sendEmail({
    to: opts.to,
    subject: WELCOME_EMAIL_SUBJECT,
    text: buildWelcomeEmailText(baseUrl),
    html: buildWelcomeEmailHtml(baseUrl),
  });
}
