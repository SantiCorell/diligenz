import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer }[];
};

/** Zoho Mail (España/UE): smtp.zoho.eu · Puerto 587 (TLS) o 465 (SSL) */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createSmtpTransport() {
  const host = process.env.SMTP_HOST!;
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure =
    process.env.SMTP_SECURE === "true" || (process.env.SMTP_SECURE !== "false" && port === 465);

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
    console.warn("[email] SMTP no configurado; no se envía correo a", opts.to);
    return false;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER!;
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
    console.error("[email] Error enviando correo:", err);
    throw err;
  }
}

/** Verifica conexión SMTP (útil tras configurar Zoho). */
export async function verifySmtpConnection(): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  await createSmtpTransport().verify();
  return true;
}
