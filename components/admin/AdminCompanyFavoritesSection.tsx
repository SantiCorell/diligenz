import Link from "next/link";
import { getCompanyFavoritesDetailed } from "@/lib/company-favorites";

export default async function AdminCompanyFavoritesSection({
  companyId,
}: {
  companyId: string;
}) {
  const favorites = await getCompanyFavoritesDetailed(companyId);

  return (
    <section className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--brand-primary)]">Favoritos</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/80">
            Usuarios que han guardado esta empresa en favoritos.
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-800">
          {favorites.length} favorito{favorites.length === 1 ? "" : "s"}
        </span>
      </div>

      {favorites.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--foreground)]/65">
          Nadie la tiene en favoritos todavía.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {favorites.map((row) => (
            <li
              key={row.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {row.name?.trim() || row.email}
                </p>
                <p className="text-xs text-slate-500 truncate">{row.email}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500">
                  {row.savedAt.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <Link
                  href={`/admin/users?q=${encodeURIComponent(row.email)}`}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  Ver usuario
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
