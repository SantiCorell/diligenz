import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import { getSessionWithUser } from "@/lib/session";
import {
  countActiveInfoRequests,
  getMaxConcurrentInfoRequests,
} from "@/lib/buyer-info-request-limit";

export default async function BuyerDashboardPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role === "PROFESSIONAL") redirect("/dashboard/professional");

  const userId = session.user.id;
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxConcurrentInfoRequests: true, role: true },
  });
  const maxSlots = getMaxConcurrentInfoRequests(
    session.user.role,
    dbUser?.maxConcurrentInfoRequests
  );

  const [pendingInfo, activeInfo] = await Promise.all([
    prisma.userCompanyInterest.count({
      where: { userId, type: "REQUEST_INFO", status: "PENDING" },
    }),
    countActiveInfoRequests(userId),
  ]);

  const displayName = getDisplayName(session.user.email);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="panel-hero">
        <p className="page-eyebrow">Panel del inversor</p>
        <h1 className="page-title mt-2">
          Hola{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/75 sm:text-base">
          Gestiona tu perfil y oportunidades desde un solo lugar. El marketplace público está a un
          clic cuando quieras explorar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="btn-secondary">
            Ir a la web
          </Link>
          <Link href="/companies" className="btn-primary">
            Explorar empresas publicadas
          </Link>
        </div>
      </div>

      {pendingInfo > 0 && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/95 px-5 py-4 text-sm text-amber-950 shadow-sm">
          <p className="font-semibold">Tienes {pendingInfo} solicitud{pendingInfo === 1 ? "" : "es"} en revisión</p>
          <p className="mt-1 opacity-95">
            Uno de nuestros agentes se pondrá en contacto contigo lo antes posible. Puedes ver el
            detalle en &quot;Mis empresas&quot;.
          </p>
          <Link
            href="/dashboard/mis-empresas"
            className="mt-3 inline-block text-sm font-bold text-amber-950 underline underline-offset-2 hover:opacity-90"
          >
            Ver mis empresas →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/dashboard/profile"
          className="group page-card page-card-padded page-card-interactive text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Mi perfil y verificación
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Email, mandato de compra, DNI, datos de contacto y acceso a tu Google Drive.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Abrir →
          </span>
        </Link>

        <Link
          href="/dashboard/mis-empresas"
          className="group page-card page-card-padded page-card-interactive text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Mis empresas
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Solicitudes de información y el estado de cada gestión.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Ver listado →
          </span>
        </Link>

        <Link
          href="/companies"
          className="group page-card page-card-padded page-card-interactive text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Explorar empresas
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Catálogo publicado en la web: sectores, cifras orientativas y fichas detalladas.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Ir al marketplace →
          </span>
        </Link>

        <Link
          href="/dashboard/mis-empresas"
          className={`group page-card page-card-padded page-card-interactive text-left ${
            pendingInfo > 0 ? "border-amber-200/80 bg-amber-50/40" : ""
          }`}
        >
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Solicitudes de información
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            {maxSlots != null ? (
              <>
                Tienes{" "}
                <span className="font-bold text-[var(--brand-primary)]">
                  {activeInfo}/{maxSlots}
                </span>{" "}
                solicitudes activas
                {pendingInfo > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-semibold text-amber-950">
                      {pendingInfo} en revisión
                    </span>
                  </>
                )}
                .
              </>
            ) : (
              <>
                Tienes{" "}
                <span className="font-bold text-[var(--brand-primary)]">{activeInfo}</span>{" "}
                solicitudes activas.
              </>
            )}
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Ver mis empresas →
          </span>
        </Link>
      </div>

      <div className="page-card page-card-padded flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--brand-primary)]">¿Necesitas ayuda?</p>
          <p className="text-sm text-[var(--foreground)] opacity-80 mt-0.5">
            Contacto, valoraciones orientativas y servicios desde la web pública.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contact"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
          >
            Contacto
          </Link>
          <Link
            href="/valuation"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
          >
            Valoración
          </Link>
        </div>
      </div>
    </div>
  );
}
