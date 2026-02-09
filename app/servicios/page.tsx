import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import Image from "next/image";
import ContactFormServicios from "@/components/contact/ContactFormServicios";

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
    options: [{ label: "Proyecto a medida", price: "Según consulta" }],
  },
  {
    service: "Vender empresa",
    options: [
      { label: "Poner empresa en venta en la plataforma", price: "Gratis" },
      { label: "1 a 3 empresas", price: "100 €/mes + acuerdo de venta" },
      { label: "De 3 a 10 empresas", price: "300 €/mes + precio a consultar" },
      { label: "Más de 10 empresas", price: "Precio a consultar" },
      { label: "Comisión sobre venta", price: "Porcentaje a negociar en todas las opciones" },
    ],
  },
  {
    service: "Valorar tu empresa",
    options: [
      { label: "Valoración profesional por nuestros expertos", price: "Desde 1.500 €" },
      { label: "Informe detallado y defensa ante comprador", price: "A consulta" },
    ],
  },
  {
    service: "Comprar empresa",
    options: [
      { label: "Asesoramiento en búsqueda y análisis", price: "Según consulta" },
      { label: "Due diligence y apoyo en negociación", price: "Según consulta" },
    ],
  },
];

export default function ServiciosPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        {/* Hero */}
        <section className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-10 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--brand-primary)]">
              Servicios profesionales
            </h1>
            <p className="mt-4 text-lg text-[var(--foreground)] opacity-90">
              Due diligence, venta y compra de empresas. Asesoramiento experto para operaciones de M&A.
            </p>
            <a
              href="#pricing"
              className="mt-6 inline-block rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white font-medium hover:opacity-90"
            >
              Ver precios
            </a>
          </div>
        </section>

        {/* Servicios: en móvil se apilan en columna (imagen arriba, texto abajo) */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 md:space-y-24">
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
                  <span className="text-sm font-medium text-[var(--brand-primary)] opacity-80">
                    {srv.subtitle}
                  </span>
                  <h2 className="mt-1 text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
                    {srv.title}
                  </h2>
                  <p className="mt-4 text-[var(--foreground)] opacity-90 leading-relaxed">
                    {srv.description}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[var(--brand-primary)]">
                    {srv.price}
                  </p>
                  <p className="text-sm text-[var(--foreground)] opacity-75">
                    {srv.priceNote}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Pricing - tarjetas con personalidad Diligenz */}
        <section id="pricing" className="py-16 md:py-24 border-t border-[var(--brand-primary)]/10 bg-gradient-to-b from-[var(--brand-bg)] to-[var(--brand-bg-lavender)]/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="inline-block text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-90 mb-2">
                Tarifas
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
                Precios
              </h2>
              <p className="mt-3 text-[var(--foreground)] opacity-85 max-w-2xl mx-auto">
                Tarifas orientativas. Consulte sin compromiso para un presupuesto adaptado a su caso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {PRICING_TABLE.map((row) => (
                <div
                  key={row.service}
                  className="group relative rounded-2xl bg-white p-0 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[var(--brand-primary)]/10"
                >
                  {/* Barra superior de marca */}
                  <div
                    className="h-1.5 w-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)]/70"
                    aria-hidden
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-[var(--brand-primary)] tracking-tight">
                      {row.service}
                    </h3>
                    <ul className="mt-5 space-y-4 flex-1">
                      {row.options.map((opt, i) => (
                        <li
                          key={i}
                          className="flex flex-col gap-1 text-sm border-b border-[var(--brand-bg)] last:border-0 last:pb-0 pb-3 last:pb-0"
                        >
                          <span className="text-[var(--foreground)] opacity-90 leading-snug">
                            {opt.label}
                          </span>
                          <span className="font-bold text-[var(--brand-primary)] text-base">
                            {opt.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-[var(--foreground)] opacity-80 max-w-xl mx-auto">
              En todas las opciones de venta se aplica un porcentaje sobre la operación cerrada, a negociar.
            </p>

            <div className="mt-12 text-center flex flex-col items-center gap-4">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-8 py-4 text-white font-semibold hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                Valorar mi empresa
              </Link>
              <a
                href="#contacto"
                className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
              >
                ¿Tienes dudas? Ponte en contacto con nosotros
              </a>
            </div>
          </div>
        </section>

        {/* Ponte en contacto - formulario tipo Deale */}
        <section id="contacto" className="py-16 md:py-24 bg-gradient-to-b from-[var(--brand-bg-lavender)]/40 to-[var(--brand-bg)] border-t border-[var(--brand-primary)]/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="inline-block text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-90 mb-2">
                Consúltanos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
                Ponte en contacto con nosotros
              </h2>
              <p className="mt-3 text-[var(--foreground)] opacity-85 max-w-xl mx-auto">
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
