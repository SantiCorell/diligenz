import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PROFESSIONAL_MIS_EMPRESAS_PATH,
  SELL_DASHBOARD_PATH,
} from "@/lib/companies-dashboard-path";
import {
  countActiveOwnerCompanies,
  getMaxConcurrentCompanies,
  isUnlimitedProfessionalCompanies,
} from "@/lib/professional-company-limit";
import { getDisplayName } from "@/lib/user-display";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/session";

export default async function ProfessionalDashboardPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role !== "PROFESSIONAL" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const displayName =
    session.user.name?.trim() || getDisplayName(session.user.email);

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { maxConcurrentCompanies: true, role: true },
  });
  const unlimited = isUnlimitedProfessionalCompanies(session.user.role);
  const maxSlots = getMaxConcurrentCompanies(
    session.user.role,
    dbUser?.maxConcurrentCompanies
  );
  const activeCompanies = await countActiveOwnerCompanies(session.userId);
  const canAddMore = unlimited || (maxSlots != null && activeCompanies < maxSlots);

  return (
    <main className="max-w-6xl mx-auto space-y-8">
      <div className="panel-hero">
        <p className="page-eyebrow">Dashboard del profesional</p>
        <h1 className="page-title mt-2">
          Hola{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/75 sm:text-base">
          Gestiona tus empresas, tu perfil y la documentación desde un solo lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
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
            Datos de contacto, verificación, acuerdo de colaboración y carpeta de Google Drive.
          </p>
        </Link>
        <Link
          href={PROFESSIONAL_MIS_EMPRESAS_PATH}
          className="page-card page-card-padded group transition hover:border-[var(--brand-primary)]/30 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Acceso directo
          </p>
          <h2 className="mt-2 text-lg font-bold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
            Mis empresas
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">
            Revisa el estado de tus proyectos, valoración y documentación por empresa.
          </p>
        </Link>

        {!unlimited && maxSlots != null && (
          <Link
            href={PROFESSIONAL_MIS_EMPRESAS_PATH}
            className={`page-card page-card-padded group transition hover:border-[var(--brand-primary)]/30 hover:shadow-md sm:col-span-2 md:col-span-1 ${
              activeCompanies >= maxSlots ? "border-amber-200/80 bg-amber-50/40" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
              Acceso directo
            </p>
            <h2 className="mt-2 text-lg font-bold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">
              Empresas activas
            </h2>
            <p className="mt-2 text-sm text-[var(--foreground)]/75">
              Tienes{" "}
              <span className="font-bold text-[var(--brand-primary)]">
                {activeCompanies}/{maxSlots}
              </span>{" "}
              espacios ocupados.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">
              Ver mis empresas →
            </span>
          </Link>
        )}
      </div>

      {canAddMore ? (
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
      ) : (
        <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)]/50 px-5 py-4 text-sm">
          <p className="font-semibold text-[var(--brand-dark)]">
            Límite de empresas alcanzado ({maxSlots}/{maxSlots})
          </p>
          <p className="mt-1 text-[var(--foreground)]/85">
            Para subir más proyectos, libera un espacio o{" "}
            <Link href="/contact" className="font-semibold text-[var(--brand-primary)] hover:underline">
              contacta con Diligenz
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
