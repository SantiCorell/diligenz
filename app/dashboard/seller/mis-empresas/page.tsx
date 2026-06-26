import Link from "next/link";
import { SELL_DASHBOARD_PATH, companiesDashboardPath } from "@/lib/companies-dashboard-path";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionWithUser } from "@/lib/session";
import {
  OwnerCompaniesList,
  OwnerCompaniesListSkeleton,
} from "@/components/dashboard/OwnerCompaniesList";

export default async function SellerMisEmpresasPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role === "PROFESSIONAL") redirect("/dashboard/professional/mis-empresas");
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const dashboardPath = companiesDashboardPath(session.user.role);

  return (
    <main className="max-w-6xl mx-auto">
      <div className="panel-hero mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="page-eyebrow">Panel del vendedor</p>
          <h1 className="page-title mt-1">Mis empresas en venta</h1>
          <p className="mt-2 text-sm text-[var(--foreground)]/75 sm:text-base">
            Gestiona tus empresas de forma confidencial. Una vez publicadas en la web, la ficha la
            actualiza solo Diligenz.
          </p>
        </div>
        <Link href={SELL_DASHBOARD_PATH} className="btn-primary shrink-0">
          Subir nueva empresa
        </Link>
      </div>

      <Suspense fallback={<OwnerCompaniesListSkeleton />}>
        <OwnerCompaniesList userId={session.userId} dashboardPath={dashboardPath} />
      </Suspense>
    </main>
  );
}
