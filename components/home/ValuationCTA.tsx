import Link from "next/link";
import { getValuationServiceSchema } from "@/lib/seo";

const POINTS = [
  "Sin registro obligatorio",
  "Datos confidenciales",
  "Resultado inmediato",
  "Basado en mercado real en España",
] as const;

export default function ValuationCTA() {
  const schema = getValuationServiceSchema();

  return (
    <section
      id="valorar-empresa"
      aria-labelledby="valoracion-heading"
      className="relative py-12 md:py-16"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--brand-primary)]/95 via-[var(--brand-primary)]/85 to-[var(--brand-bg-mint)]/85 p-8 shadow-[0_20px_60px_rgba(145,70,255,0.15)] backdrop-blur-sm md:p-10 lg:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
            <div className="text-white">
              <span className="inline-block rounded-full bg-[var(--brand-bg-mint)] px-3 py-1 text-xs font-semibold text-[var(--brand-dark)]">
                Valoración gratuita
              </span>
              <h2
                id="valoracion-heading"
                className="mt-4 text-2xl font-bold sm:text-3xl"
              >
                Valora tu empresa en minutos
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
                Obtén una valoración orientativa de tu pyme en España a partir de facturación,
                EBITDA, sector y ubicación. Sin coste y sin registro obligatorio.
              </p>
              <p className="mt-4 text-xs text-white/75">
                Más de 3.200 valoraciones realizadas en Diligenz
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xl">
              <p className="mb-4 text-sm font-semibold text-[var(--brand-dark)]">
                Qué incluye
              </p>
              <ul className="space-y-3 text-sm text-[var(--foreground)]/80">
                {POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-bg-mint)] text-xs font-bold text-[var(--brand-dark)]">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sell"
                className="mt-6 block w-full rounded-2xl bg-[var(--brand-primary)] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-[var(--brand-primary)]/25 transition hover:opacity-95"
              >
                Valorar mi empresa ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
