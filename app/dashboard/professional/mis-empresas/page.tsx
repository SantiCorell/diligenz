import Link from "next/link";
import {
  PROFESSIONAL_DASHBOARD_PATH,
  SELL_DASHBOARD_PATH,
} from "@/lib/companies-dashboard-path";
import {
  getMaxConcurrentCompanies,
  isUnlimitedProfessionalCompanies,
} from "@/lib/professional-company-limit";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/session";
import ProfessionalCompanySlots, {
  type ProfessionalCompanySlot,
} from "@/components/dashboard/ProfessionalCompanySlots";

function companyStatusMeta(company: {
  status: string;
  deals: { published: boolean }[];
}): { label: string; className: string } {
  const deal = company.deals[0];
  if (deal?.published) {
    return { label: "Publicado", className: "bg-green-100 text-green-700" };
  }
  if (company.status === "IN_PROCESS") {
    return { label: "En revisión", className: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]" };
  }
  return { label: "Borrador", className: "bg-amber-100 text-amber-700" };
}

export default async function ProfessionalMisEmpresasPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role !== "PROFESSIONAL" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { maxConcurrentCompanies: true, role: true },
  });
  const unlimited = isUnlimitedProfessionalCompanies(session.user.role);
  const maxSlots =
    getMaxConcurrentCompanies(
      session.user.role,
      dbUser?.maxConcurrentCompanies
    ) ?? 3;

  const companies = await prisma.company.findMany({
    where: { ownerId: session.userId, removedAt: null },
    include: { deals: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "asc" },
  });

  const slots: ProfessionalCompanySlot[] = companies.map((company) => {
    const deal = company.deals[0];
    const status = companyStatusMeta(company);
    return {
      id: company.id,
      title: deal?.title || company.name || "Proyecto confidencial",
      sector: company.sector,
      location: company.location,
      statusLabel: status.label,
      statusClass: status.className,
    };
  });

  const canAddMore = unlimited || slots.length < maxSlots;

  return (
    <main className="max-w-6xl mx-auto space-y-5">
      <div className="rounded-xl bg-white border border-[var(--brand-primary)]/10 shadow-sm p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="page-eyebrow">Dashboard del profesional</p>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
              Mis empresas
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--foreground)] opacity-85 max-w-2xl">
              {unlimited
                ? "Empresas que has subido como profesional. Una vez publicadas, la ficha la actualiza solo Diligenz."
                : `Puedes tener hasta ${maxSlots} empresas activas a la vez. Cada espacio es un proyecto en curso.`}
            </p>
          </div>
          {canAddMore && (
            <Link href={SELL_DASHBOARD_PATH} className="btn-primary shrink-0 text-sm">
              Subir nueva empresa
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--brand-primary)]/10 bg-white p-4 shadow-sm sm:p-5">
        <ProfessionalCompanySlots
          filled={slots}
          maxSlots={maxSlots}
          isUnlimited={unlimited}
        />
      </div>

      <p className="text-center pb-4">
        <Link
          href={PROFESSIONAL_DASHBOARD_PATH}
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          ← Volver al dashboard
        </Link>
      </p>
    </main>
  );
}
