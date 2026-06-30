import Link from "next/link";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { getUserFavoritesDetailed } from "@/lib/company-favorites";
import BuyerFavoritesList from "@/components/dashboard/BuyerFavoritesList";

export default async function FavoritesPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login?from=/dashboard/favorites");
  if (session.user.role === "PROFESSIONAL") redirect("/dashboard/professional");
  if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const favorites = await getUserFavoritesDetailed(session.user.id);
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="rounded-2xl border border-rose-200/40 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <Heart className="h-5 w-5 fill-current" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">Mis favoritos</h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground)]/75 max-w-2xl">
              Empresas guardadas para revisar más tarde. No consumen cupo de solicitudes activas en
              &quot;Mis empresas&quot;.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-primary)]/[0.05] px-4 py-3 text-xs sm:text-sm text-[var(--brand-dark)] leading-relaxed">
          <p className="font-semibold text-[var(--brand-primary)]">
            Guardar en favoritos no da acceso a la información
          </p>
          <p className="mt-1 text-[var(--foreground)]/80">
            Para obtener datos y documentación, entra en la ficha y pulsa &quot;¿Estás interesado?&quot;
            para solicitar más información. La solicitud aparecerá en &quot;Mis empresas&quot;.
          </p>
        </div>
      </div>

      <BuyerFavoritesList favorites={favorites} />

      <div className="flex flex-wrap justify-center gap-2 pb-4">
        <Link
          href="/companies"
          className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          Explorar empresas
        </Link>
        <Link
          href={isAdmin ? "/admin" : "/dashboard/buyer"}
          className="rounded-lg border border-[var(--brand-primary)]/35 bg-white px-4 py-2 text-xs font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/5"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
