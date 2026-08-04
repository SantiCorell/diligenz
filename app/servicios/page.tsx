import type { Metadata } from "next";
import {
  Scale,
  Landmark,
  Users,
  LineChart,
  ChevronDown,
} from "lucide-react";
import ShellLayout from "@/components/layout/ShellLayout";
import BudgetCalculatorSection from "@/components/servicios/BudgetCalculatorSection";
import PlansToggle from "@/components/servicios/PlansToggle";
import { SITE_URL, SITE_NAME, getBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Servicios M&A | Legal, Fiscal, Laboral y Financiero | ${SITE_NAME}`,
  description:
    "Servicios profesionales de M&A en España: due diligence legal, fiscal, laboral y financiera, valoración de empresas, SPA y planes de compra-venta. Presupuesto orientativo en segundos.",
  keywords: [
    "servicios M&A España",
    "due diligence legal España",
    "due diligence fiscal laboral",
    "due diligence financiera",
    "valoración de empresas España",
    "SPA compraventa empresas",
    "asesoramiento M&A España",
    "vender empresa con asesor",
    "comprar empresa due diligence",
  ],
  openGraph: {
    title: `Servicios M&A | Legal, Fiscal, Laboral y Financiero | ${SITE_NAME}`,
    description:
      "Due diligence, valoración, contratos y planes de acompañamiento para comprar o vender tu empresa en España. Presupuesto en segundos.",
    url: `${SITE_URL}/servicios`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/servicios` },
};

const AREA_SERVICES = [
  {
    id: "legal",
    icon: Scale,
    title: "Legal",
    description:
      "Due diligence legal, SPA, pactos de socios, contratos y constitución de SL.",
    items: [
      "Due diligence legal",
      "Contrato de compraventa (SPA)",
      "Pactos de socios y NDA",
      "Constitución de SL",
    ],
  },
  {
    id: "fiscal",
    icon: Landmark,
    title: "Fiscal",
    description:
      "Due diligence fiscal, estructura de la operación y planificación tributaria.",
    items: [
      "Due diligence fiscal",
      "Estructura asset vs share deal",
      "Contingencias y riesgos AEAT",
      "Planificación fiscal",
    ],
  },
  {
    id: "laboral",
    icon: Users,
    title: "Laboral",
    description:
      "Due diligence laboral, plantilla, Seguridad Social y personas clave.",
    items: [
      "Due diligence laboral",
      "Subrogación de plantilla",
      "Contingencias por contratación",
      "Personas clave y no competencia",
    ],
  },
  {
    id: "financiero",
    icon: LineChart,
    title: "Financiero",
    description:
      "Due diligence financiera, valoración de empresa y modelo financiero.",
    items: [
      "Due diligence financiera",
      "Valoración profesional",
      "Valoración orientativa plus",
      "Modelo y proyecciones",
    ],
  },
];

const FAQ_SERVICIOS = [
  {
    question: "¿Qué áreas cubre la due diligence de Diligenz?",
    answer:
      "Cubrimos due diligence legal, fiscal, laboral y financiera. Puedes contratar cada área por separado o la due diligence completa (legal + fiscal + laboral) con un solo informe consolidado y un interlocutor único, con ahorro frente a contratar tres firmas distintas.",
  },
  {
    question: "¿Puedo contratar solo un servicio suelto?",
    answer:
      "Sí. Constitución de SL, pacto de socios, contratos mercantiles, valoraciones, due diligence por área o redacción de SPA se pueden contratar de forma independiente, con precio cerrado o horquilla según el tipo de encargo.",
  },
  {
    question: "¿Cómo funciona el presupuesto instantáneo?",
    answer:
      "Eliges el servicio y los parámetros de alcance (áreas, facturación, plazo). Recibes una horquilla orientativa al momento. Un asesor de Diligenz la confirma en menos de 24 horas. En encargos que dependen del hallazgo (toda DD y SPA) el precio final se cierra tras un fee de scoping reembolsable.",
  },
  {
    question: "¿Qué diferencia hay entre los planes Esencial, Avanzado y Pro?",
    answer:
      "Esencial prepara la operación (valoración, materiales, checklist). Avanzado añade mandato activo con compradores o DD y negociación. Pro incluye dirección jurídica o acompañamiento completo hasta el cierre, con success fee según el tamaño de la operación.",
  },
  {
    question: "¿Diligenz opera solo en España?",
    answer:
      "Sí. Diligenz está enfocado en el mercado español de M&A y compraventa de pymes. Los precios y tramos están calibrados para mid-market (aprox. 1–10 M€ de facturación).",
  },
];

function getServicesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servicios M&A Diligenz",
    description:
      "Servicios profesionales de M&A en España: legal, fiscal, laboral y financiero. Due diligence, valoración, SPA y planes de compra-venta.",
    numberOfItems: AREA_SERVICES.length,
    itemListElement: AREA_SERVICES.map((srv, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: `Servicios ${srv.title} M&A`,
        description: srv.description,
        serviceType: srv.title,
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        areaServed: { "@type": "Country", name: "España", alternateName: "ES" },
        url: `${SITE_URL}/servicios#${srv.id}`,
      },
    })),
  };
}

function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SERVICIOS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function getWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Servicios M&A | Legal, Fiscal, Laboral y Financiero | ${SITE_NAME}`,
    description:
      "Catálogo de servicios profesionales de M&A en España: due diligence, valoración, contratos y planes de acompañamiento para comprar o vender empresas.",
    url: `${SITE_URL}/servicios`,
    inLanguage: "es-ES",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: {
      "@type": "Thing",
      name: "Servicios de fusiones y adquisiciones (M&A) en España",
    },
  };
}

export default function ServiciosPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", url: SITE_URL },
    { name: "Servicios", url: `${SITE_URL}/servicios` },
  ]);

  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getServicesSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageSchema()) }}
      />

      <div className="relative">
        {/* Hero — estilo compacto como mock HTML */}
        <section className="relative px-4 pb-4 pt-10 text-center sm:px-6 md:pb-6 md:pt-12">
          <div className="mx-auto max-w-3xl">
            <p className="page-eyebrow">Servicios M&A</p>
            <h1 className="page-title mt-3">
              Asesoramiento experto, presupuesto{" "}
              <span className="page-title-highlight">en segundos</span>
            </h1>
            <p className="page-lead mx-auto mt-3 max-w-xl">
              Due diligence, valoraciones, contratos y acompañamiento para
              comprar o vender tu empresa.
            </p>
          </div>
        </section>

        {/* 1. Servicios por área — primero */}
        <section
          id="areas"
          className="scroll-mt-24 border-t border-[var(--brand-primary)]/10 bg-[var(--brand-surface)] py-12 md:py-14"
          aria-labelledby="areas-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="page-eyebrow">Servicios individuales</p>
              <h2
                id="areas-heading"
                className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl md:text-4xl"
              >
                ¿Solo necesitas una pieza? Contrátala suelta
              </h2>
              <p className="mt-3 text-sm text-[var(--foreground)]/70 sm:text-base">
                Legal, fiscal, laboral y financiero — de forma independiente.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AREA_SERVICES.map((area) => {
                const Icon = area.icon;
                return (
                  <a
                    key={area.id}
                    id={area.id}
                    href={`/servicios?area=${area.id}#calculadora`}
                    className="group flex flex-col gap-3 rounded-[1.35rem] bg-white p-6 shadow-sm outline-none transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(145,70,255,0.35)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
                    itemScope
                    itemType="https://schema.org/Service"
                    aria-label={`Calcular presupuesto de servicios ${area.title}`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                    <h3
                      className="text-lg font-extrabold tracking-tight text-[var(--brand-dark)]"
                      itemProp="name"
                    >
                      {area.title}
                    </h3>
                    <meta itemProp="description" content={area.description} />
                    <ul className="flex flex-1 flex-col gap-1.5 text-sm text-[var(--foreground)]/75">
                      {area.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="font-extrabold text-[var(--brand-primary)]">
                            ·
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto pt-1 text-sm font-bold text-[var(--brand-primary)] group-hover:underline group-hover:underline-offset-4">
                      Calcular presupuesto →
                    </span>
                    <meta itemProp="areaServed" content="España" />
                    <link itemProp="provider" href={SITE_URL} />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Planes M&A */}
        <section
          id="planes"
          className="scroll-mt-24 py-12 md:py-14"
          aria-labelledby="planes-heading"
        >
          {/* ancla legacy /servicios#pricing */}
          <div id="pricing" className="sr-only" aria-hidden />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-2 max-w-2xl text-center">
              <p className="page-eyebrow">Planes de acompañamiento</p>
              <h2
                id="planes-heading"
                className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl md:text-4xl"
              >
                Un plan para cada operación
              </h2>
              <p className="mt-3 text-sm text-[var(--foreground)]/70 sm:text-base">
                Elige cuánto acompañamiento necesitas. Cambia de plan cuando quieras.
              </p>
            </div>
            <PlansToggle />
          </div>
        </section>

        {/* 3. Calculadora */}
        <section
          id="calculadora"
          className="scroll-mt-24 border-t border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-8 md:py-10"
          aria-labelledby="calc-heading"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 id="calc-heading" className="sr-only">
              Calculadora de presupuesto
            </h2>
            <BudgetCalculatorSection />
          </div>
        </section>

        {/* FAQ AEO/GEO */}
        <section
          id="faq"
          className="py-12 md:py-14"
          aria-labelledby="faq-heading"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-14">
            <div>
              <p className="page-eyebrow">FAQ</p>
              <h2
                id="faq-heading"
                className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl"
              >
                Preguntas frecuentes
              </h2>
            </div>
            <ul className="space-y-3">
              {FAQ_SERVICIOS.map((item, index) => (
                <li
                  key={item.question}
                  className="overflow-hidden rounded-2xl border border-[var(--brand-primary)]/10 bg-white"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <details className="group" open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-[var(--brand-dark)] sm:text-base [&::-webkit-details-marker]:hidden">
                      <span itemProp="name">{item.question}</span>
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-[var(--brand-primary)] transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div
                      className="px-5 pb-4"
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <p
                        className="text-sm leading-relaxed text-[var(--foreground)]/75"
                        itemProp="text"
                      >
                        {item.answer}
                      </p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-14 sm:px-6 md:pb-16">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--brand-primary)] to-[#7B3BE0] px-8 py-12 text-center text-white sm:px-12 sm:py-14">
            <div
              className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-white/10"
              aria-hidden
            />
            <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              Empieza con un presupuesto en segundos
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm text-white/85 sm:text-base">
              Horquilla orientativa al momento. Confirmación en 24 h. Sin compromiso.
            </p>
            <div className="relative mt-6">
              <a
                href="#calculadora"
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-6 py-3 text-sm font-semibold text-[var(--brand-dark)] transition hover:opacity-95"
              >
                Calcular mi presupuesto →
              </a>
            </div>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
