import { sendEmail } from "@/lib/email";
import { appBaseUrl, buildEmailLayout, buildEmailText } from "./layout";

export function companyInfoRequestSubject(companyName: string): string {
  return `Solicitud recibida: ${companyName} — Diligenz`;
}

export function buildCompanyInfoRequestEmailHtml(opts: {
  companyName: string;
  companyUrl: string;
  userName?: string | null;
}): string {
  const firstName = opts.userName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : "Hola,";
  const company = opts.companyName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return buildEmailLayout({
    preheader: `Hemos registrado tu interés en ${opts.companyName}.`,
    title: "Solicitud de información confirmada",
    subtitle: "Un paso más cerca de tu próxima oportunidad.",
    greeting,
    paragraphs: [
      `Hemos registrado correctamente tu solicitud de información sobre <strong style="color:#171d2b;">${company}</strong>.`,
      "En <strong style=\"color:#171d2b;\">Diligenz</strong> trabajamos con confidencialidad y rigor: cada petición es revisada por nuestro equipo para ofrecerte la información adecuada y acompañarte en el proceso.",
    ],
    highlightHtml: `<strong>¿Qué ocurre ahora?</strong><br><br>
Una persona de nuestro equipo se pondrá en contacto contigo <strong>en breve</strong> para compartir más detalles sobre la empresa y resolver tus dudas.<br><br>
Mientras tanto, puedes seguir explorando oportunidades desde tu panel.`,
    cta: { label: "Ver ficha de la empresa", href: opts.companyUrl },
    afterCtaParagraphs: [
      "Gracias por confiar en Diligenz. Estamos aquí para que encuentres la operación que buscas con total tranquilidad.",
      "Si necesitas ampliar tu consulta, responde a este correo y te atenderemos personalmente.",
    ],
    footerNote: "Has recibido este correo porque solicitaste información sobre una empresa en Diligenz.",
  });
}

export function buildCompanyInfoRequestEmailText(opts: {
  companyName: string;
  companyUrl: string;
  userName?: string | null;
}): string {
  const firstName = opts.userName?.trim().split(/\s+/)[0];
  return buildEmailText({
    title: "Solicitud de información confirmada — Diligenz",
    greeting: firstName ? `Hola ${firstName},` : "Hola,",
    paragraphs: [
      `Hemos registrado tu solicitud de información sobre ${opts.companyName}.`,
      "Una persona de nuestro equipo se pondrá en contacto contigo en breve para darte más detalles y resolver tus dudas.",
      "En Diligenz tratamos cada solicitud con confidencialidad y el máximo rigor profesional.",
    ],
    cta: { label: "Ver ficha de la empresa", href: opts.companyUrl },
    afterCtaParagraphs: [
      "Gracias por confiar en Diligenz.",
      "¿Necesitas algo más? Responde a este correo.",
    ],
  });
}

export async function sendCompanyInfoRequestEmail(opts: {
  to: string;
  userName?: string | null;
  companyName: string;
  companyId: string;
}): Promise<boolean> {
  const baseUrl = appBaseUrl();
  const companyUrl = `${baseUrl}/companies/${encodeURIComponent(opts.companyId)}`;

  return sendEmail({
    to: opts.to,
    subject: companyInfoRequestSubject(opts.companyName),
    text: buildCompanyInfoRequestEmailText({
      companyName: opts.companyName,
      companyUrl,
      userName: opts.userName,
    }),
    html: buildCompanyInfoRequestEmailHtml({
      companyName: opts.companyName,
      companyUrl,
      userName: opts.userName,
    }),
  });
}
