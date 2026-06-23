import { appBaseUrl, buildEmailLayout, buildEmailText } from "./layout";

export const WELCOME_EMAIL_SUBJECT = "Bienvenido a Diligenz";

export function buildWelcomeEmailHtml(opts: { name?: string | null; baseUrl?: string }): string {
  const baseUrl = opts.baseUrl ?? appBaseUrl();
  const firstName = opts.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName},` : "Hola,";

  return buildEmailLayout({
    preheader: "Tu acceso a la plataforma de M&A más dinámica de España.",
    title: "Bienvenido a Diligenz",
    subtitle: "El entorno seguro donde compradores, vendedores y profesionales se conectan.",
    greeting,
    paragraphs: [
      "Nos alegra tenerte con nosotros. <strong style=\"color:#171d2b;\">Diligenz</strong> nace para acercar operaciones de compraventa de empresas con tecnología, datos y un equipo que te acompaña en cada paso.",
      "Desde tu panel podrás explorar oportunidades, solicitar información confidencial, valorar empresas y gestionar todo el proceso con la discreción que merece una operación de M&amp;A.",
    ],
    highlightHtml: `<strong>¿Qué puedes hacer ya?</strong><br><br>
• Explorar empresas y filtrar por sector, tamaño y rentabilidad<br>
• Solicitar información detallada con un solo clic<br>
• Acceder a herramientas de valoración y seguimiento<br>
• Contar con el respaldo de profesionales especializados`,
    cta: { label: "Ir a mi panel", href: `${baseUrl}/dashboard` },
    afterCtaParagraphs: [
      "Nuestro equipo revisará tu perfil y, si hace falta, se pondrá en contacto contigo para completar tu alta.",
      "Si tienes cualquier duda, responde a este correo: estaremos encantados de ayudarte.",
    ],
    footerNote: "Has recibido este correo porque te has registrado en Diligenz.",
  });
}

export function buildWelcomeEmailText(opts: { name?: string | null; baseUrl?: string }): string {
  const baseUrl = opts.baseUrl ?? appBaseUrl();
  const firstName = opts.name?.trim().split(/\s+/)[0];
  return buildEmailText({
    title: "Bienvenido a Diligenz",
    greeting: firstName ? `Hola ${firstName},` : "Hola,",
    paragraphs: [
      "Nos alegra tenerte con nosotros. Diligenz conecta compradores, vendedores y profesionales en un entorno seguro y confidencial.",
      "Desde tu panel podrás explorar oportunidades, solicitar información y gestionar tu proceso de M&A.",
      "¿Qué puedes hacer ya?",
      "- Explorar empresas y filtrar por sector, tamaño y rentabilidad",
      "- Solicitar información detallada",
      "- Usar herramientas de valoración y seguimiento",
    ],
    cta: { label: "Ir a mi panel", href: `${baseUrl}/dashboard` },
    afterCtaParagraphs: [
      "Nuestro equipo revisará tu perfil y se pondrá en contacto si es necesario.",
      "¿Dudas? Responde a este correo.",
    ],
  });
}
