import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import { CASOS_EXITO } from "@/lib/casos-exito";
import BlogPostImage from "@/components/blog/BlogPostImage";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Casos de éxito | Compraventa y M&A de pymes | ${SITE_NAME}`,
  description:
    "Casos reales de venta de empresas y M&A con Diligenz: continuidad del CEO, asesoramiento en valoración, preparación para la venta y due diligence. Pymes que cerraron operaciones con éxito.",
  keywords: [
    "casos de éxito venta empresas",
    "venta pyme éxito",
    "M&A casos reales España",
    "continuidad CEO venta empresa",
    "asesoramiento venta empresa",
    "due diligence preparación",
  ],
  openGraph: {
    title: `Casos de éxito | ${SITE_NAME}`,
    description:
      "Casos reales de compraventa de pymes: cómo estructuramos operaciones, asesoramos en valoración y preparamos empresas para vender con éxito.",
    url: `${SITE_URL}/blog/casos-exito`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/blog/casos-exito` },
};

export default function CasosExitoPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-8 md:py-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Link
              href="/blog"
              className="text-sm text-[var(--brand-primary)] hover:underline"
            >
              ← Blog
            </Link>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
              Casos de éxito
            </h1>
            <p className="mt-3 text-[var(--foreground)] opacity-90">
              Historias reales de compraventa de pymes: cómo preparamos empresas, estructuramos operaciones y acompañamos hasta el cierre.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition"
            >
              Ver también artículos del blog
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {[...CASOS_EXITO]
                .sort((a, b) => (b.date > a.date ? 1 : -1))
                .map((caso) => (
                  <Link
                    key={caso.slug}
                    href={`/blog/casos-exito/${caso.slug}`}
                    className="group flex flex-col rounded-2xl border border-[var(--brand-primary)]/15 bg-white overflow-hidden hover:shadow-xl hover:border-[var(--brand-primary)]/25 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] w-full bg-[var(--brand-bg-lavender)] overflow-hidden">
                      <BlogPostImage
                        src={caso.image}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-5 md:p-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-80">
                        Caso real
                      </span>
                      <time className="text-xs font-medium text-[var(--brand-primary)] opacity-90 mt-1">
                        {new Date(caso.date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-xs text-[var(--foreground)] opacity-70">
                        · {caso.readTime}
                      </span>
                      <h2 className="mt-2 text-lg font-bold text-[var(--brand-primary)] line-clamp-2 group-hover:underline">
                        {caso.title}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--foreground)] opacity-85 line-clamp-2 flex-1">
                        {caso.excerpt}
                      </p>
                      <span className="mt-4 text-sm font-semibold text-[var(--brand-primary)]">
                        Leer caso →
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--brand-primary)]/10 py-6">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-[var(--foreground)] opacity-85">
              ¿Quiere valorar su empresa o explorar una venta con criterio?
            </p>
            <Link
              href="/servicios#pricing"
              className="mt-3 inline-block rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
            >
              Ver servicios y precios
            </Link>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
