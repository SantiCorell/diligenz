import { sendEmail } from "@/lib/email";
import { getMandatoNotifyEmail } from "@/lib/email-config";
import { appBaseUrl, buildEmailLayout, buildEmailText, escapeHtml } from "./layout";

export async function sendInfoRequestAdvanceEmails(opts: {
  buyerEmail: string;
  buyerName?: string | null;
  companyName: string;
  companyId: string;
}): Promise<{ buyerSent: boolean; teamSent: boolean }> {
  const baseUrl = appBaseUrl();
  const companyUrl = `${baseUrl}/companies/${encodeURIComponent(opts.companyId)}`;
  const panelUrl = `${baseUrl}/admin/actions`;
  const firstName = opts.buyerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : "Hola,";
  const company = escapeHtml(opts.companyName);

  const buyerSent = await sendEmail({
    to: opts.buyerEmail,
    subject: `Seguimos con ${opts.companyName} — Diligenz`,
    text: buildEmailText({
      title: "Vamos a contactarte pronto",
      greeting,
      paragraphs: [
        `Has decidido avanzar con ${opts.companyName}.`,
        "El equipo de Diligenz se pondrá en contacto contigo en breve para continuar la operación.",
      ],
      cta: { label: "Ver la empresa", href: companyUrl },
    }),
    html: buildEmailLayout({
      preheader: `Has decidido avanzar con ${opts.companyName}. Te contactaremos pronto.`,
      title: "Vamos a contactarte pronto",
      greeting,
      paragraphs: [
        `Has decidido avanzar con <strong style="color:#171d2b;">${company}</strong>.`,
        "El equipo de Diligenz se pondrá en contacto contigo en breve para continuar la operación.",
      ],
      cta: { label: "Ver la empresa", href: companyUrl },
      footerNote: "Has recibido este correo porque pulsaste «Quiero avanzar» en Diligenz.",
    }),
  });

  const teamSent = await sendEmail({
    to: getMandatoNotifyEmail(),
    subject: `El comprador quiere avanzar — ${opts.companyName}`,
    text: buildEmailText({
      title: "Un comprador quiere avanzar",
      paragraphs: [
        `${opts.buyerName?.trim() || opts.buyerEmail} (${opts.buyerEmail}) ha pulsado «Quiero avanzar» en ${opts.companyName}.`,
        "La solicitud está en Conversaciones. Contactad con el comprador.",
      ],
      cta: { label: "Abrir solicitudes", href: panelUrl },
    }),
    html: buildEmailLayout({
      preheader: `${opts.buyerEmail} quiere avanzar con ${opts.companyName}.`,
      title: "Un comprador quiere avanzar",
      paragraphs: [
        `<strong style="color:#171d2b;">${escapeHtml(opts.buyerName?.trim() || opts.buyerEmail)}</strong> (${escapeHtml(opts.buyerEmail)}) ha pulsado «Quiero avanzar» en <strong style="color:#171d2b;">${company}</strong>.`,
        "La solicitud está en Conversaciones. Contactad con el comprador.",
      ],
      cta: { label: "Abrir solicitudes", href: panelUrl },
    }),
  });

  return { buyerSent, teamSent };
}
