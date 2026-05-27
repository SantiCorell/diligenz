import type { SeoLandingConfig } from "@/components/seo/SeoLanding";

export const COMPRAR_EMPRESAS_LANDING: SeoLandingConfig = {
  slug: "comprar-empresas",
  breadcrumbLabel: "Comprar empresas",
  h1: "Comprar empresas en España",
  subtitle:
    "Encuentra oportunidades verificadas de pymes y empresas en venta. Filtra por sector, ubicación y rango de precio en el marketplace líder de M&A.",
  sections: [
    {
      title: "Oportunidades de adquisición verificadas",
      paragraphs: [
        "En Diligenz accedes a empresas en venta en España con información estructurada: sector, ubicación, facturación orientativa y datos clave para evaluar cada oportunidad.",
        "Regístrate gratis para ver fichas completas, contactar con vendedores y recibir alertas de nuevas oportunidades alineadas con tu perfil de inversión.",
      ],
    },
    {
      title: "Cómo funciona el proceso de compra",
      paragraphs: [
        "Explora el catálogo, guarda tus favoritas y solicita información bajo NDA cuando quieras profundizar.",
        "Nuestro equipo te acompaña en due diligence, negociación y cierre si necesitas asesoramiento M&A profesional.",
      ],
    },
    {
      title: "Más de 300 empresas en el marketplace",
      paragraphs: [
        "Tecnología, hostelería, industrial, servicios y más sectores. Actualizamos el catálogo con nuevas oportunidades cada semana.",
      ],
    },
  ],
  ctas: [
    { label: "Ver empresas en venta", href: "/companies", primary: true },
    { label: "Crear cuenta gratis", href: "/register" },
    { label: "Asesoramiento para compradores", href: "/servicios#comprar-empresa" },
  ],
  relatedLinks: [
    { label: "Compraventa de empresas", href: "/compraventa-empresas" },
    { label: "Plataforma M&A", href: "/plataforma-m-a" },
    { label: "Guía para comprar PYMES en funcionamiento", href: "/blog/guia-comprar-pymes-en-funcionamiento" },
  ],
};

export const VENDER_EMPRESA_LANDING: SeoLandingConfig = {
  slug: "vender-empresa",
  breadcrumbLabel: "Vender empresa",
  h1: "Vender tu empresa con confidencialidad",
  subtitle:
    "Publica tu negocio en el marketplace líder de España, valora tu empresa en minutos y conecta con compradores e inversores verificados.",
  sections: [
    {
      title: "Proceso claro y confidencial",
      paragraphs: [
        "Valoramos tu empresa de forma orientativa, preparamos la documentación y te conectamos con compradores cualificados sin comprometer la confidencialidad de tu operación.",
        "Puedes publicar gratis en la plataforma o contratar asesoramiento integral para maximizar el precio y acelerar el cierre.",
      ],
    },
    {
      title: "Beneficios de vender con Diligenz",
      paragraphs: [
        "Acceso a inversores verificados, valoración orientativa gratuita, datos room seguro y respaldo de Cañizares Valle en aspectos legales y fiscales.",
        "Acompañamos desde la preparación hasta la firma del contrato de compraventa.",
      ],
    },
    {
      title: "¿Vendes por jubilación o sucesión?",
      paragraphs: [
        "Tenemos experiencia en ventas por jubilación, sucesión familiar y transmisión parcial. Consulta nuestra guía específica o contacta con nuestro equipo.",
      ],
    },
  ],
  ctas: [
    { label: "Valorar mi empresa gratis", href: "/sell", primary: true },
    { label: "Servicios de venta", href: "/servicios#vender-empresa" },
    { label: "Contactar", href: "/contact" },
  ],
  relatedLinks: [
    { label: "Vender empresa por jubilación", href: "/blog/vender-empresa-por-jubilacion" },
    { label: "Compraventa de empresas", href: "/compraventa-empresas" },
    { label: "Blog: vender paso a paso", href: "/blog/vender-empresa-paso-a-paso" },
  ],
};

export const COMPRAVENTA_EMPRESAS_LANDING: SeoLandingConfig = {
  slug: "compraventa-empresas",
  breadcrumbLabel: "Compraventa de empresas",
  h1: "Compraventa de empresas en España",
  subtitle:
    "Marketplace M&A para comprar, vender y valorar pymes. Guía completa del proceso, tipos de venta y herramientas profesionales en un solo lugar.",
  sections: [
    {
      title: "Qué es la compraventa de empresas",
      paragraphs: [
        "La compraventa de empresas (M&A) es la transmisión de un negocio entre propietario e inversor o comprador. Incluye valoración, negociación, due diligence y cierre legal.",
        "Diligenz digitaliza este proceso para pymes en España: más transparencia, menos fricción y acceso a compradores verificados.",
      ],
    },
    {
      title: "Tipos de operación",
      paragraphs: [
        "Venta total: transmisión del 100 % del negocio. Venta parcial: el fundador mantiene participación. Venta por jubilación o sucesión: planificación de la transición generacional.",
        "Cada modalidad requiere preparación distinta; te ayudamos a elegir la estructura adecuada.",
      ],
    },
    {
      title: "Del teaser al cierre",
      paragraphs: [
        "Preparación → publicación → contacto con compradores → due diligence → negociación → contrato y cierre.",
        "Ofrecemos valoración orientativa, marketplace privado y servicios de asesoramiento M&A a medida.",
      ],
    },
  ],
  ctas: [
    { label: "Comprar empresas", href: "/comprar-empresas", primary: true },
    { label: "Vender mi empresa", href: "/vender-empresa" },
    { label: "Ver catálogo", href: "/companies" },
  ],
  relatedLinks: [
    { label: "Plataforma M&A", href: "/plataforma-m-a" },
    { label: "Servicios profesionales", href: "/servicios" },
    { label: "Blog M&A", href: "/blog" },
  ],
};

export const PLATAFORMA_MA_LANDING: SeoLandingConfig = {
  slug: "plataforma-m-a",
  breadcrumbLabel: "Plataforma M&A",
  h1: "Plataforma M&A online en España",
  subtitle:
    "Compraventa de empresas digital: valoración, listados verificados, datos room y asesoramiento profesional. La alternativa moderna a los métodos tradicionales.",
  sections: [
    {
      title: "Funcionalidades de la plataforma",
      paragraphs: [
        "Catálogo de empresas en venta con filtros por sector y ubicación. Valoración orientativa en minutos. Gestión confidencial de interesados y documentación.",
        "Panel para vendedores y compradores con seguimiento de operaciones y comunicación segura.",
      ],
    },
    {
      title: "Ventajas frente a métodos tradicionales",
      paragraphs: [
        "Mayor alcance de compradores, procesos más rápidos, transparencia en datos y costes más competitivos que la intermediación clásica exclusiva.",
        "Combinamos tecnología con el respaldo de un despacho con más de 50 años de experiencia en M&A.",
      ],
    },
    {
      title: "Para compradores, vendedores e inversores",
      paragraphs: [
        "Compradores encuentran oportunidades alineadas con su tesis. Vendedores publican con confidencialidad. Inversores acceden a deal flow estructurado en España.",
      ],
    },
  ],
  ctas: [
    { label: "Explorar empresas", href: "/companies", primary: true },
    { label: "Registrarse gratis", href: "/register" },
    { label: "Solicitar demo", href: "/contact" },
  ],
  relatedLinks: [
    { label: "Comprar empresas", href: "/comprar-empresas" },
    { label: "Vender empresa", href: "/vender-empresa" },
    { label: "Sobre Diligenz", href: "/sobre-nosotros" },
  ],
};
