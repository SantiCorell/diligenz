/**
 * Prueba SMTP (Zoho Mail). Uso: npm run email:test
 * Opcional: TEST_EMAIL_TO=tu@email.com npm run email:test
 */
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = Number(process.env.SMTP_PORT ?? 587);
const secure =
  process.env.SMTP_SECURE === "true" || (process.env.SMTP_SECURE !== "false" && port === 465);

if (!host || !user || !pass) {
  console.error("Falta SMTP_HOST, SMTP_USER o SMTP_PASS en .env.local");
  process.exit(1);
}

const to = process.env.TEST_EMAIL_TO || user;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  ...(port === 587 && !secure ? { requireTLS: true } : {}),
});

try {
  await transporter.verify();
  console.log("✓ Conexión SMTP OK:", host);
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? user,
    to,
    subject: "Prueba Diligenz — correo automático",
    text: "Si recibes este mensaje, Zoho Mail está configurado correctamente en Diligenz.",
  });
  console.log("✓ Correo de prueba enviado a", to);
} catch (e) {
  console.error("✗ Error SMTP:", e.message || e);
  process.exit(1);
}
