import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import { getSessionWithUser } from "@/lib/session";

export default async function BuyerDashboardPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (
    session.user.role !== "BUYER" &&
    session.user.role !== "PROFESSIONAL" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  const userId = session.user.id;
  const [pendingInfo, requestsCount] = await Promise.all([
    prisma.userCompanyInterest.count({
      where: { userId, type: "REQUEST_INFO", status: "PENDING" },
    }),
    prisma.userCompanyInterest.count({ where: { userId, type: "REQUEST_INFO" } }),
  ]);

  const displayName = getDisplayName(session.user.email);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-2xl bg-gradient-to-br from-[var(--brand-primary)]/12 via-white to-white border border-[var(--brand-primary)]/15 shadow-md p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]/80">
          Panel del inversor
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--brand-primary)]">
          Hola{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-2xl">
          Gestiona tu perfil, documentos y oportunidades desde un solo lugar. El marketplace público
          está a un clic cuando quieras explorar.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-white border-2 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] shadow-sm hover:bg-[var(--brand-primary)]/5 transition"
          >
            Ir a la web
          </Link>
          <Link
            href="/companies"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 transition"
          >
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Solicitudes" value={requestsCount} />
        <StatCard
          label="En revisión"
          value={pendingInfo}
          highlight={pendingInfo > 0}
        />
        <StatCard label="Acceso web" value="Activo" isText />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/dashboard/profile"
          className="group rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 hover:shadow-lg hover:border-[var(--brand-primary)]/25 transition text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-primary)] group-hover:underline">
            Mi perfil y verificación
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Email, NDA, DNI y datos de contacto. Completa los checks para desbloquear todo el
            contenido.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Abrir →
          </span>
        </Link>

        <Link
          href="/dashboard/buyer/documents"
          className="group rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 hover:shadow-lg hover:border-[var(--brand-primary)]/25 transition text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-primary)] group-hover:underline">
            Mis documentos y Drive
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Enlace a tu carpeta personal y recordatorios de documentación confidencial.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Abrir →
          </span>
        </Link>

        <Link
          href="/companies"
          className="group rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 hover:shadow-lg hover:border-[var(--brand-primary)]/25 transition text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-primary)] group-hover:underline">
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
          className="group rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 hover:shadow-lg hover:border-[var(--brand-primary)]/25 transition text-left"
        >
          <h2 className="text-lg font-semibold text-[var(--brand-primary)] group-hover:underline">
            Mis empresas
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Solicitudes de información y el estado de cada gestión.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
            Ver listado →
          </span>
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white/90 p-5 flex flex-wrap items-center justify-between gap-4">
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

function StatCard({
  label,
  value,
  highlight,
  isText,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  isText?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        highlight
          ? "border-amber-200 bg-amber-50/80"
          : "border-[var(--brand-primary)]/10 bg-white"
      }`}
    >
      <p className="text-xs font-medium text-[var(--foreground)] opacity-70">{label}</p>
      <p
        className={`mt-1 font-bold ${
          highlight ? "text-amber-950" : "text-[var(--brand-primary)]"
        } ${isText ? "text-base" : "text-xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
