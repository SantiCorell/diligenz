/** Sistema de diseño de correos Diligenz (compatible con clientes de email). */
export const EMAIL = {
  primary: "#9146ff",
  primaryDark: "#6b2fd4",
  dark: "#171d2b",
  text: "#4d4d50",
  muted: "#6b7280",
  accent: "#dbeda8",
  lavender: "#d6d2f0",
  bg: "#f4f3f7",
  white: "#ffffff",
  border: "#e8e6ef",
};

export function appBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.diligenz.es";
  return url.replace(/\/$/, "");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:${EMAIL.text};font-family:Verdana,Geneva,sans-serif;font-size:15px;line-height:1.65;">${text}</p>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;color:${EMAIL.dark};font-family:Verdana,Geneva,sans-serif;font-size:24px;line-height:1.25;font-weight:bold;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:0 0 20px;color:${EMAIL.muted};font-family:Verdana,Geneva,sans-serif;font-size:14px;line-height:1.5;">${text}</p>`;
}

function highlightBox(innerHtml: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${EMAIL.lavender};border-radius:14px;border:1px solid ${EMAIL.border};">
<tr><td style="padding:18px 20px;font-family:Verdana,Geneva,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL.dark};">${innerHtml}</td></tr>
</table>`;
}

function ctaButton(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
<tr><td style="border-radius:999px;background:${EMAIL.primary};">
<a href="${href}" style="display:inline-block;padding:14px 32px;color:${EMAIL.white};font-family:Verdana,Geneva,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

function footer(baseUrl: string, note?: string): string {
  const extra = note
    ? `<p style="margin:0 0 12px;color:#b8bcc4;font-family:Verdana,Geneva,sans-serif;font-size:12px;line-height:1.5;">${note}</p>`
    : "";
  return `<tr><td style="background:${EMAIL.dark};padding:28px 24px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="color:#b8bcc4;font-family:Verdana,Geneva,sans-serif;font-size:12px;line-height:1.6;">
<strong style="color:${EMAIL.white};font-size:14px;">Diligenz</strong><br>
Plataforma de M&amp;A · Confidencialidad y rigor en cada operación<br><br>
<a href="mailto:info@diligenz.es" style="color:#dbeda8;text-decoration:none;">info@diligenz.es</a><br>
Calle Colón 39, 1º · Valencia, España<br>
<a href="${baseUrl}" style="color:#b8bcc4;text-decoration:none;">diligenz.es</a>
${extra ? `<br><br>${extra}` : ""}
</td></tr>
</table>
</td></tr>`;
}

export type EmailLayoutOptions = {
  preheader?: string;
  title: string;
  subtitle?: string;
  greeting?: string;
  paragraphs?: string[];
  highlightHtml?: string;
  cta?: { label: string; href: string };
  afterCtaParagraphs?: string[];
  footerNote?: string;
};

export function buildEmailLayout(opts: EmailLayoutOptions): string {
  const baseUrl = appBaseUrl();
  const preheader = opts.preheader ? escapeHtml(opts.preheader) : "";
  const greeting = opts.greeting
    ? paragraph(`<strong style="color:${EMAIL.dark};">${escapeHtml(opts.greeting)}</strong>`)
    : "";

  const bodyParts = [
    heading(escapeHtml(opts.title)),
    opts.subtitle ? subheading(escapeHtml(opts.subtitle)) : "",
    greeting,
    ...(opts.paragraphs ?? []).map((p) => paragraph(p)),
    opts.highlightHtml ? highlightBox(opts.highlightHtml) : "",
    opts.cta ? ctaButton(opts.cta.label, opts.cta.href) : "",
    ...(opts.afterCtaParagraphs ?? []).map((p) => paragraph(p)),
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${EMAIL.white};">
<tr><td style="background:linear-gradient(135deg,${EMAIL.primary} 0%,${EMAIL.primaryDark} 100%);padding:28px 24px;text-align:center;">
<div style="font-family:Verdana,Geneva,sans-serif;font-size:28px;font-weight:bold;color:${EMAIL.white};letter-spacing:-0.5px;">Diligenz</div>
<div style="margin-top:6px;font-family:Verdana,Geneva,sans-serif;font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:0.08em;text-transform:uppercase;">Compraventa de empresas con confianza</div>
</td></tr>
<tr><td style="padding:32px 28px 8px;">
${bodyParts.join("\n")}
</td></tr>
${footer(baseUrl, opts.footerNote)}
</table>
</body>
</html>`;
}

export function buildEmailText(opts: {
  title: string;
  greeting?: string;
  paragraphs?: string[];
  highlight?: string;
  cta?: { label: string; href: string };
  afterCtaParagraphs?: string[];
}): string {
  const lines = [
    opts.title,
    "",
    opts.greeting ?? "",
    ...(opts.paragraphs ?? []),
    opts.highlight ? `\n${opts.highlight}\n` : "",
    opts.cta ? `${opts.cta.label}: ${opts.cta.href}` : "",
    ...(opts.afterCtaParagraphs ?? []),
    "",
    "— Diligenz",
    "info@diligenz.es · diligenz.es",
    "Calle Colón 39, 1º · Valencia, España",
  ].filter((l) => l !== "");
  return lines.join("\n");
}
