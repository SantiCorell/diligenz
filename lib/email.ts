import nodemailer from "nodemailer";
import {
  getSmtpEnv,
  getSmtpFromAddress,
  getSmtpPort,
  isEmailConfigured,
  isSmtpSecure,
} from "@/lib/email-config";

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer }[];
};

export { isEmailConfigured, getMandatoNotifyEmail } from "@/lib/email-config";

function createSmtpTransport() {
  const host = getSmtpEnv("HOST")!;
  const user = getSmtpEnv("USER")!;
  const pass = getSmtpEnv("PASS")!;
  const port = getSmtpPort();
  const secure = isSmtpSecure(port);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS); no se envía correo a",
      opts.to
    );
    return false;
  }

  const from = getSmtpFromAddress();
  const transporter = createSmtpTransport();

  try {
    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text.replace(/\n/g, "<br>"),
      attachments: opts.attachments,
    });
    return true;
  } catch (err) {
    console.error("[email] Error enviando correo a", opts.to, err);
    throw err;
  }
}

/** Verifica conexión SMTP (útil tras configurar Zoho). */
export async function verifySmtpConnection(): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  await createSmtpTransport().verify();
  return true;
}
