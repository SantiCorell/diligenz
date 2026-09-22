import Link from "next/link";
import { redirect } from "next/navigation";
import { SELL_DASHBOARD_PATH } from "@/lib/companies-dashboard-path";
import { countActiveOwnerCompanies } from "@/lib/professional-company-limit";
import { getDisplayName } from "@/lib/user-display";
import { getSessionWithUser } from "@/lib/session";

export default async function SellerDashboardPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role === "PROFESSIONAL") redirect("/dashboard/professional");

  const displayName =
    session.user.name?.trim() || getDisplayName(session.user.email);
  const activeCompanies = await countActiveOwnerCompanies(session.userId);

  return (
    <main className="max-w-6xl mx-auto space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#9b6dff] via-[#7c4dff] to-[#5b34d6] px-6 py-8 text-white shadow-lg sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Panel del vendedor</p>
        <h1 className="mt-2 text-3xl font-bold">Hola{displayName ? `, ${displayName}` : ""}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          Gestiona tus empresas, el mandato de venta y la documentación desde un solo lugar.
          {activeCompanies > 0
            ? ` Tienes ${activeCompanies} ${activeCompanies === 1 ? "empresa activa" : "empresas activas"}.`
            : " Todavía no tienes proyectos en curso."}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/profile"
          className="page-card page-card-padded group transition hover:border-[var(--brand-primary)]/30 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Acceso directo
          </p>
          <h2 className="mt-2 text-lg font-bold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Mi perfil
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">
            Datos de contacto, verificación, mandato y carpeta de Google Drive.
          </p>
        </Link>
        <Link
          href="/dashboard/seller/mis-empresas"
          className="page-card page-card-padded group transition hover:border-[var(--brand-primary)]/30 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Acceso directo
          </p>
          <h2 className="mt-2 text-lg font-bold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Empresas activas
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">
            {activeCompanies === 0
              ? "Aún no tienes proyectos en curso. Sube tu primera empresa para empezar."
              : (
                <>
                  Tienes{" "}
                  <span className="font-bold text-[var(--brand-primary)]">
                    {activeCompanies}
                  </span>{" "}
                  {activeCompanies === 1 ? "empresa activa" : "empresas activas"}.
                  Revisa valoración y documentación.
                </>
              )}
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Ver empresas activas →
          </span>
        </Link>
      </div>

      <div className="panel-hero flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-eyebrow">Nuevo proyecto</p>
          <h2 className="page-title mt-1 text-xl sm:text-2xl">Subir empresa</h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75 sm:text-base">
            Obtén una valoración orientativa en minutos y da de alta un nuevo proyecto de venta.
          </p>
        </div>
        <Link href={SELL_DASHBOARD_PATH} className="btn-primary shrink-0">
          Subir nueva empresa
        </Link>
      </div>
    </main>
  );
}
