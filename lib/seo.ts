/**
 * Constantes y helpers SEO para DILIGENZ.
 * Optimizado para posicionar en España y competir con Deale (deale.es).
 * Centraliza URLs, nombres y descripciones para metadata, JSON-LD y sitemap.
 */

export const SITE_URL = "https://www.diligenz.es";

export const SITE_NAME = "DILIGENZ";

/** Eslogan orientado a búsquedas: España + líder + compra/venda/valora */
export const TAGLINE = "Compra, vende y valora empresas en España";

export const DEFAULT_DESCRIPTION =
  "Diligenz es el marketplace líder en España para comprar y vender empresas. Valora tu empresa en minutos, conecta con inversores verificados y cierra operaciones con asesoramiento M&A profesional. Due diligence y compraventa de pymes. Alternativa española de confianza.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.png`;

/**
 * Keywords para posicionar en Google España y ganar a deale.es / deale.com.
 * Incluye: términos con "España", intención (comprar/vender/valorar), M&A, pymes, alternativas.
 */
export const SEO_KEYWORDS = [
  "comprar empresas España",
  "vender empresa España",
  "marketplace empresas España",
  "valorar empresa España",
  "valoración de empresas España",
  "comprar empresas",
  "vender empresa",
  "valorar empresa",
  "valoración de empresas",
  "marketplace de empresas",
  "M&A España",
  "plataforma M&A España",
  "fusiones y adquisiciones España",
  "venta de pymes España",
  "comprar pymes",
  "venta de negocios",
  "inversores privados España",
  "due diligence España",
  "compraventa de pymes",
  "valoración de pymes",
  "vender mi negocio España",
  "comprar negocio España",
  "inversión en empresas España",
  "marketplace M&A",
  "oportunidades de inversión España",
  "empresas en venta España",
  "venta de empresa familiar",
  "asesoramiento M&A España",
  "valoración orientativa empresa",
  "diligencia debida",
  "mejor plataforma vender empresa",
  "donde vender mi empresa",
  "donde comprar empresas",
  "inversores verificados",
  "cierre de operaciones",
];

/** JSON-LD Organization para schema.org — señales fuertes de España y autoridad */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: DEFAULT_DESCRIPTION,
    areaServed: [
      { "@type": "Country", name: "España" },
      { "@type": "AdministrativeArea", name: "España" },
    ],
    knowsAbout: [
      "M&A",
      "compraventa de empresas",
      "valoración de empresas",
      "due diligence",
      "pymes",
    ],
    slogan: TAGLINE,
    sameAs: [] as string[], // Añadir LinkedIn, Twitter cuando existan
  };
}

/** JSON-LD WebSite con SearchAction para sitio de búsqueda */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: getOrganizationSchema(),
    inLanguage: "es-ES",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/companies?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** JSON-LD Marketplace (tipo específico para el negocio) — España explícito */
export function getMarketplaceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Marketplace",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    areaServed: { "@type": "Country", name: "España", alternateName: "ES" },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/companies`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Preguntas frecuentes para FAQPage schema — rich snippets en Google España */
export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "¿Dónde puedo comprar empresas en España?",
    answer:
      "En Diligenz, el marketplace líder en España para comprar empresas. Accede a oportunidades verificadas de pymes y empresas en venta, con due diligence y asesoramiento M&A profesional. Regístrate gratis y explora el catálogo.",
  },
  {
    question: "¿Cómo vender mi empresa en España?",
    answer:
      "Regístrate en Diligenz, valora tu empresa con nuestra herramienta orientativa en minutos y publica tu proyecto en el marketplace. Conectamos con inversores y compradores verificados. Ofrecemos asesoramiento en todo el proceso de venta hasta el cierre.",
  },
  {
    question: "¿Qué es un marketplace M&A?",
    answer:
      "Un marketplace M&A (fusiones y adquisiciones) es una plataforma que conecta a vendedores de empresas con compradores e inversores. Diligenz es la plataforma de referencia en España para compraventa de pymes y empresas, con valoración, due diligence y cierre seguro.",
  },
  {
    question: "¿Cuánto cuesta valorar mi empresa?",
    answer:
      "En Diligenz puedes obtener una valoración orientativa de tu empresa de forma gratuita en minutos. Para informes profesionales y due diligence ofrecemos servicios a medida; consulta la sección Servicios y precios.",
  },
  {
    question: "¿Diligenz es solo para España?",
    answer:
      "Sí. Diligenz está enfocado en el mercado español: empresas, compradores e inversores en España. Somos la alternativa de confianza para M&A y compraventa de pymes en España.",
  },
];

/** JSON-LD FAQPage para aparecer en resultados enriquecidos de Google */
export function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
