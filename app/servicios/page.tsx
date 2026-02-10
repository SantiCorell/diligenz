import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import Image from "next/image";
import { FileSearch, Store, TrendingUp, Briefcase, Check } from "lucide-react";
import ContactFormServicios from "@/components/contact/ContactFormServicios";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Servicios M&A en España | Valoración, due diligence y venta de empresas | ${SITE_NAME}`,
  description:
    "Servicios de M&A en España: due diligence, valoración de empresas, venta de empresa y asesoramiento a compradores. Preparación para la venta, búsqueda de comprador y apoyo en el cierre. Líder en compraventa de pymes.",
  keywords: [
    "servicios M&A España",
    "due diligence España",
    "vender empresa España",
    "comprar empresa España",
    "valoración de empresas España",
    "asesoramiento M&A España",
  ],
  openGraph: {
    title: `Servicios M&A España | Due diligence y venta de empresas | ${SITE_NAME}`,
    description:
      "Due diligence, valoración y venta de empresas en España. Servicios profesionales de M&A del marketplace líder.",
    url: `${SITE_URL}/servicios`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/servicios` },
};

const SERVICES = [
  {
    id: "due-diligence",
    title: "Due Diligence",
    subtitle: "Análisis integral antes de operar",
    description:
      "Realizamos un análisis exhaustivo de la empresa objetivo: financiero, legal, fiscal, operativo y comercial. Nuestro equipo entrega un informe claro que permite tomar decisiones informadas y negociar con seguridad.",
    price: "Según consulta",
    priceNote: "Presupuesto adaptado al tamaño y complejidad del proyecto.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  },
  {
    id: "vender-empresa",
    title: "Vender empresa",
    subtitle: "De la valoración al cierre",
    description:
      "Le acompañamos en todo el proceso de venta: valoración, preparación de materiales, búsqueda y cualificación de compradores, negociación y cierre. Trabajamos con discreción y con el objetivo de maximizar el valor y la probabilidad de cierre.",
    price: "Varios planes",
    priceNote: "Ver tabla de precios más abajo.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
  },
  {
    id: "comprar-empresa",
    title: "Comprar empresa",
    subtitle: "Asesoramiento para inversores y compradores",
    description:
      "Ofrecemos servicios de asesoramiento integral para compradores e inversores: identificación de oportunidades alineadas con su perfil, análisis de targets, apoyo en due diligence y en la negociación. Le ayudamos a invertir con criterio y a cerrar operaciones con garantías.",
    price: "Según consulta",
    priceNote: "Servicios a medida según su estrategia de inversión.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  },
];

const PRICING_TABLE = [
  {
    service: "Due Diligence",
    icon: FileSearch,
    options: [{ label: "Proyecto a medida", price: "Según consulta" }],
  },
  {
    service: "Vender empresa",
    icon: Store,
    options: [
      { label: "Poner empresa en venta en la plataforma", price: "Gratis" },
      { label: "1 a 3 empresas", price: "100 €/mes + acuerdo de venta" },
      { label: "De 3 a 10 empresas", price: "300 €/mes + precio a consultar" },
      { label: "Más de 10 empresas", price: "Precio a consultar" },
      { label: "Comisión sobre venta", price: "Porcentaje a negociar" },
    ],
  },
  {
    service: "Valorar tu empresa",
    icon: TrendingUp,
    options: [
      { label: "Valoración profesional por nuestros expertos", price: "Desde 1.500 €" },
      { label: "Informe detallado y defensa ante comprador", price: "A consulta" },
    ],
  },
  {
    service: "Comprar empresa",
    icon: Briefcase,
    options: [
      { label: "Asesoramiento en búsqueda y análisis", price: "Según consulta" },
      { label: "Due diligence y apoyo en negociación", price: "Según consulta" },
    ],
  },
];

function getServicesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servicios M&A Diligenz",
    description: "Due diligence, venta y compra de empresas. Asesoramiento M&A en España.",
    itemListElement: SERVICES.map((srv, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: srv.title,
        description: srv.description,
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        areaServed: { "@type": "Country", name: "España" },
      },
    })),
  };
}

export default function ServiciosPage() {
  const servicesSchema = getServicesSchema();
  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <div className="min-h-screen bg-[var(--brand-bg)]">
        {/* Hero */}
        <section className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-8 md:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
              Servicios profesionales
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90">
              Due diligence, venta y compra de empresas. Asesoramiento experto para operaciones de M&A.
            </p>
            <a
              href="#pricing"
              className="mt-5 inline-block rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Ver precios
            </a>
          </div>
        </section>

        {/* Servicios: en móvil se apilan en columna (imagen arriba, texto abajo) */}
        <section className="py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 md:space-y-16">
            {SERVICES.map((srv) => (
              <article
                key={srv.id}
                id={srv.id}
                className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 md:items-center"
              >
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[var(--brand-bg-lavender)] order-1">
                  <Image
                    src={srv.image}
                    alt={srv.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="order-2">
                  <span className="text-xs font-medium text-[var(--brand-primary)] opacity-80">
                    {srv.subtitle}
                  </span>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
                    {srv.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
                    {srv.description}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[var(--brand-primary)]">
                    {srv.price}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-80">
                    {srv.priceNote}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Pricing - en sintonía con el resto del proyecto */}
        <section id="pricing" className="py-8 md:py-10 border-t border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-80">
                Tarifas
              </span>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
                Precios
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-2xl mx-auto">
                Tarifas orientativas. Consulte sin compromiso para un presupuesto adaptado a su caso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {PRICING_TABLE.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.service}
                    className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 shadow-md hover:shadow-lg hover:border-[var(--brand-primary)]/20 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-[var(--brand-primary)]/15 flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--brand-primary)]">
                        {row.service}
                      </h3>
                    </div>
                    <ul className="space-y-4 flex-1">
                      {row.options.map((opt, i) => (
                        <li key={i} className="flex flex-col gap-1">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--brand-primary)]/70 shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span className="text-sm text-[var(--foreground)] opacity-90 leading-snug">
                              {opt.label}
                            </span>
                          </div>
                          <p className="pl-6 text-sm font-bold text-[var(--brand-primary)]">
                            {opt.price}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-center text-sm text-[var(--foreground)] opacity-75 max-w-xl mx-auto">
              En las opciones de venta se aplica un porcentaje sobre la operación cerrada, a negociar.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sell"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition w-full sm:w-auto"
              >
                Valorar mi empresa
              </Link>
              <a
                href="#contacto"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition w-full sm:w-auto"
              >
                Contactar
              </a>
            </div>
          </div>
        </section>

        {/* Ponte en contacto - formulario tipo Deale */}
        <section id="contacto" className="py-8 md:py-10 border-t border-[var(--brand-primary)]/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-90 mb-2">
                Consúltanos
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
                Ponte en contacto con nosotros
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-xl mx-auto">
                Elige el motivo de tu consulta y te respondemos sin compromiso. Si es otro tema, selecciona «Otro» y cuéntanos.
              </p>
            </div>
            <ContactFormServicios />
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
