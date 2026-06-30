import Link from "next/link";
import { Heart, Search } from "lucide-react";
import type { UserFavoriteRow } from "@/lib/company-favorites";
import CompanyCard from "@/components/companies/CompanyCard";

export default function BuyerFavoritesList({ favorites }: { favorites: UserFavoriteRow[] }) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--brand-primary)]/20 bg-[var(--brand-bg)]/30 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <Heart className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-4 text-base font-semibold text-[var(--brand-dark)]">
          Aún no tienes favoritos
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--foreground)]/70">
          Explora el catálogo y pulsa el corazón en cualquier ficha para guardar empresas que
          quieras revisar más tarde.
        </p>
        <Link
          href="/companies"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand-primary)]/20 transition hover:opacity-95"
        >
          <Search className="h-4 w-4" aria-hidden />
          Explorar empresas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {favorites.map((item) => {
        const savedLabel = item.savedAt.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <article key={item.companyId} className="flex h-full flex-col">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 sm:text-xs">
                <Heart className="h-3 w-3 fill-current" aria-hidden />
                En favoritos
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground)]/50">
                Guardada el {savedLabel}
              </span>
            </div>

            {item.company && item.published ? (
              <CompanyCard
                company={item.company}
                isLoggedIn
                isFavorite
                compact
                ctaLabel="Ver ficha"
              />
            ) : (
              <div className="company-card-hover-wrap h-full flex-1">
                <div className="flex min-h-[300px] flex-1 flex-col justify-between rounded-[1.75rem] border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/55 p-5 sm:min-h-[320px]">
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-[var(--brand-dark)] sm:text-xl">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/75">
                      Esta operación no está publicada en el catálogo. Si te interesa, contacta con
                      el equipo para más información.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    No publicada
                  </span>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
