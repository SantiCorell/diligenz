import ShellLayout from "@/components/layout/ShellLayout";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

/** Imagen HD de Valencia — Ciudad de las Artes y las Ciencias (Unsplash, 1920px, calidad 90) */
const VALENCIA_IMAGE =
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1920&q=90";

/** Imagen "desde la montaña" / vista elevada — sección Más sobre nosotros con tono morado */
const MOUNTAIN_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90";

export const metadata: Metadata = {
  title: `Sobre nosotros | Equipo y sede en Valencia | ${SITE_NAME}`,
  description:
    "Diligenz nace en Valencia. Conoce nuestro equipo, nuestra sede y nuestra alianza con Cañizares Valle: más de 50 años de experiencia en asesoramiento empresarial, M&A y valoración de empresas en España.",
  keywords: [
    "Diligenz Valencia",
    "marketplace M&A Valencia",
    "comprar vender empresas Valencia",
    "asesoramiento M&A España",
    "Cañizares Valle",
    "valoración empresas España",
  ],
  openGraph: {
    title: `Sobre nosotros | Valencia | ${SITE_NAME}`,
    description:
      "Diligenz en Valencia: marketplace líder para comprar y vender empresas. Aliados con Cañizares Valle, más de 50 años de experiencia en M&A y asesoramiento empresarial.",
    url: `${SITE_URL}/sobre-nosotros`,
    type: "website",
    images: [{ url: VALENCIA_IMAGE, width: 1920, height: 1080, alt: "Panorámica de la Ciudad de las Artes y las Ciencias, Valencia, al atardecer — Sede de Diligenz" }],
  },
  alternates: { canonical: `${SITE_URL}/sobre-nosotros` },
};

/** JSON-LD Organization con ubicación en Valencia para SEO local */
function getAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Marketplace líder en España para comprar, vender y valorar empresas. Sede en Valencia. Socio estratégico: Cañizares Valle.",
    areaServed: { "@type": "Country", name: "España" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valencia",
      addressRegion: "Comunitat Valenciana",
      addressCountry: "ES",
    },
    knowsAbout: ["M&A", "compraventa de empresas", "valoración de empresas", "due diligence"],
  };
}

export default function SobreNosotrosPage() {
  const schema = getAboutPageSchema();

  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="min-h-screen bg-[var(--brand-bg)]">
        {/* Hero con imagen de Valencia */}
        <header className="relative">
          <div className="relative h-[42vh] min-h-[280px] md:h-[50vh] md:min-h-[360px] w-full overflow-hidden">
            <Image
              src={VALENCIA_IMAGE}
              alt="Valencia, Ciudad de las Artes y las Ciencias al atardecer: L'Hemisfèric y Pont de l'Assut de l'Or reflejados en el agua — Sede de Diligenz"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/90 via-[var(--brand-primary)]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="max-w-4xl mx-auto">
                <p className="text-white/90 text-sm font-medium uppercase tracking-widest mb-2">
                  Nuestra sede
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  Sobre nosotros
                </h1>
                <p className="mt-2 text-lg md:text-xl text-white/95 max-w-2xl">
                  Nacemos en <strong>Valencia</strong> con una misión clara: ser el marketplace de referencia en España para comprar, vender y valorar empresas.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          {/* Qué hacemos */}
          <section
            className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white/80 backdrop-blur-sm p-8 md:p-10 shadow-sm mb-10"
            aria-labelledby="que-hacemos"
          >
            <h2
              id="que-hacemos"
              className="text-2xl font-bold text-[var(--brand-primary)] mb-4"
            >
              Qué hacemos
            </h2>
            <p className="text-[var(--foreground)] opacity-90 leading-relaxed text-lg">
              En <strong>{SITE_NAME}</strong> ofrecemos un marketplace privado para la compraventa de empresas en España. Conectamos a propietarios e inversores con oportunidades verificadas, valoraciones orientativas en minutos y un proceso seguro hasta el cierre. Nuestros servicios incluyen valoración de empresas, due diligence, asesoramiento en venta y en compra, con un enfoque profesional y transparente.
            </p>
          </section>

          {/* Dónde estamos — Valencia */}
          <section
            className="rounded-2xl overflow-hidden border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/80 mb-10"
            aria-labelledby="donde-estamos"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto md:min-h-[280px]">
                <Image
                  src={VALENCIA_IMAGE}
                  alt="Panorámica Valencia, Ciudad de las Artes y las Ciencias al atardecer — donde operamos"
                  fill
                  className="object-cover object-left"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[var(--brand-primary)] font-semibold text-sm uppercase tracking-wider">
                  Dónde estamos
                </span>
                <h2 id="donde-estamos" className="text-2xl font-bold text-[var(--brand-primary)] mt-2 mb-4">
                  Valencia, nuestra base
                </h2>
                <p className="text-[var(--foreground)] opacity-90 leading-relaxed">
                  Operamos desde <strong>Valencia</strong>, una ciudad con tradición empresarial y conectada con el resto de España. Desde aquí atendemos a vendedores y compradores de empresas en todo el territorio, con la agilidad de una plataforma digital y el respaldo de los mejores socios.
                </p>
              </div>
            </div>
          </section>

          {/* Más sobre nosotros — imagen de la montaña con tono morado */}
          <section
            className="relative rounded-2xl overflow-hidden my-12 md:my-16 min-h-[320px] md:min-h-[380px]"
            aria-labelledby="mas-sobre-nosotros"
          >
            <div className="absolute inset-0">
              <Image
                src={MOUNTAIN_IMAGE}
                alt="Vista desde la montaña — Visión y ambición de Diligenz"
                fill
                className="object-cover object-center"
                sizes="100vw"
              />
              <div
                className="absolute inset-0 bg-[var(--brand-primary)]/75 mix-blend-multiply"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/95 via-[var(--brand-primary)]/60 to-[var(--brand-primary)]/40" />
            </div>
            <div className="relative flex flex-col justify-end p-8 md:p-12 min-h-[320px] md:min-h-[380px]">
              <h2
                id="mas-sobre-nosotros"
                className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-3"
              >
                Más sobre nosotros
              </h2>
              <p className="text-white/95 text-lg max-w-2xl drop-shadow-md">
                Miramos lejos: nuestra visión es ser el referente en España en compraventa de empresas. Con la solidez de Valencia como base y el respaldo de Cañizares Valle, acompañamos a vendedores e inversores en cada paso del camino.
              </p>
            </div>
          </section>

          {/* Socio estratégico — Cañizares Valle */}
          <section
            className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 md:p-10 shadow-sm mb-10"
            aria-labelledby="socio-estrategico"
          >
            <span className="text-[var(--brand-primary)] font-semibold text-sm uppercase tracking-wider">
              Alianza estratégica
            </span>
            <h2 id="socio-estrategico" className="text-2xl font-bold text-[var(--brand-primary)] mt-2 mb-6">
              Nuestro socio: Cañizares Valle
            </h2>
            <p className="text-[var(--foreground)] opacity-90 leading-relaxed text-lg mb-8">
              Las operaciones que gestionamos cuentan con el respaldo de <strong>Cañizares Valle</strong>, despacho de abogados y consultores con más de <strong>50 años de experiencia</strong> en asesoramiento integral a empresas. Su trayectoria nos permite ofrecer a nuestros clientes soluciones jurídicas, fiscales, laborales y financieras de alto nivel en todas las fases de una operación de M&A.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-xl bg-[var(--brand-bg)] border border-[var(--brand-primary)]/10">
              <div className="relative w-52 h-28 shrink-0">
                <Image
                  src="/logo-canizares-valle.png"
                  alt="Cañizares Valle — Despacho de abogados y consultores, socio de Diligenz"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--brand-primary)] text-lg">
                  Cañizares Valle
                </h3>
                <p className="text-[var(--foreground)] opacity-85 text-sm mt-2 leading-relaxed">
                  Más de 50 años de experiencia en asesoramiento fiscal, contable, laboral y jurídico empresarial. Especialistas en sector farmacéutico (más de 500 oficinas de farmacia como clientes), compraventa de empresas, sucesión familiar y consultoría especializada.
                </p>
                <a
                  href="https://www.canizaresvalle.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-[var(--brand-primary)] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 rounded"
                >
                  Visitar canizaresvalle.es
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </section>

          {/* Por qué confiar */}
          <section
            className="rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/50 p-8 md:p-10 mb-12"
            aria-labelledby="por-que-confiar"
          >
            <h2 id="por-que-confiar" className="text-2xl font-bold text-[var(--brand-primary)] mb-4">
              Por qué confiar en nosotros
            </h2>
            <p className="text-[var(--foreground)] opacity-90 leading-relaxed text-lg">
              Combinamos la agilidad y la tecnología de una plataforma digital con el respaldo de un despacho con décadas de historia. Nuestros clientes obtienen valoraciones rápidas, acceso a oportunidades verificadas y el soporte jurídico y fiscal necesario para tomar decisiones con seguridad. Todo desde Valencia, para toda España.
            </p>
          </section>

          {/* CTAs */}
          <nav className="flex flex-wrap gap-4" aria-label="Acciones siguientes">
            <Link
              href="/companies"
              className="rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-white font-semibold hover:opacity-90 transition shadow-lg"
            >
              Ver empresas en venta
            </Link>
            <Link
              href="/servicios"
              className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-6 py-3.5 text-[var(--brand-primary)] font-semibold hover:bg-[var(--brand-primary)]/10 transition"
            >
              Nuestros servicios
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-[var(--brand-primary)]/30 px-6 py-3.5 text-[var(--foreground)] font-medium hover:bg-[var(--brand-primary)]/5 transition"
            >
              Contactar
            </Link>
          </nav>
        </div>
      </div>
    </ShellLayout>
  );
}
