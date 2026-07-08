/**
 * Prueba SMTP (Zoho Mail). Uso: npm run email:test
 * Opcional: TEST_EMAIL_TO=tu@email.com npm run email:test
 */
import nodemailer from "nodemailer";

function smtpEnv(name) {
  return process.env[`SMTP_${name}`]?.trim() || process.env[`SMPT_${name}`]?.trim();
}

const host = smtpEnv("HOST");
const user = smtpEnv("USER");
const pass = smtpEnv("PASS");
const port = Number(smtpEnv("PORT") ?? 587);
const secureEnv = smtpEnv("SECURE");
const secure =
  secureEnv === "true" || (secureEnv !== "false" && port === 465);

if (!host || !user || !pass) {
  console.error("Falta SMTP_HOST/SMTP_USER/SMTP_PASS (o SMPT_* legacy) en .env.local");
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
    from: smtpEnv("FROM") ?? user,
    to,
    subject: "Prueba Diligenz — correo automático",
    text: "Si recibes este mensaje, Zoho Mail está configurado correctamente en Diligenz.",
  });
  console.log("✓ Correo de prueba enviado a", to);
} catch (e) {
  console.error("✗ Error SMTP:", e.message || e);
  process.exit(1);
}
