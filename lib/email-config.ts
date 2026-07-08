/** Lee SMTP_* con fallback a SMPT_* (typo histórico en Vercel). */
export function getSmtpEnv(name: "HOST" | "PORT" | "SECURE" | "USER" | "PASS" | "FROM"): string | undefined {
  const correct = process.env[`SMTP_${name}`]?.trim();
  if (correct) return correct;
  return process.env[`SMPT_${name}`]?.trim();
}

export function getSmtpPort(): number {
  const raw = getSmtpEnv("PORT");
  const port = Number(raw ?? 587);
  return Number.isFinite(port) ? port : 587;
}

export function isSmtpSecure(port: number): boolean {
  const secure = getSmtpEnv("SECURE");
  if (secure === "true") return true;
  if (secure === "false") return false;
  return port === 465;
}

export function isEmailConfigured(): boolean {
  return Boolean(getSmtpEnv("HOST") && getSmtpEnv("USER") && getSmtpEnv("PASS"));
}

export function getSmtpFromAddress(): string {
  return getSmtpEnv("FROM") ?? getSmtpEnv("USER") ?? "info@diligenz.es";
}

export function getMandatoNotifyEmail(): string {
  return process.env.MANDATO_NOTIFY_EMAIL?.trim() || "info@diligenz.es";
}
