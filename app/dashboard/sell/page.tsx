import Link from "next/link";
import { redirect } from "next/navigation";
import SellValuationForm from "@/components/sell/SellValuationForm";
import { companiesDashboardPath } from "@/lib/companies-dashboard-path";
import { getProfessionalCompanyQuota } from "@/lib/professional-company-limit";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/session";

export default async function DashboardSellPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login?from=/dashboard/sell");

  const role = session.user.role;
  if (role !== "SELLER" && role !== "PROFESSIONAL" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const backHref = companiesDashboardPath(role);
  const eyebrow =
    role === "PROFESSIONAL" ? "Dashboard del profesional" : "Panel del vendedor";

  if (role === "PROFESSIONAL") {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { maxConcurrentCompanies: true, role: true },
    });
    const quota = await getProfessionalCompanyQuota({
      id: session.userId,
      role: dbUser?.role ?? role,
      maxConcurrentCompanies: dbUser?.maxConcurrentCompanies,
    });
    if (!quota.canAddMore && quota.max != null) {
      return (
        <main className="max-w-3xl mx-auto space-y-6">
          <div className="panel-hero">
            <p className="page-eyebrow">{eyebrow}</p>
            <h1 className="page-title mt-2">Subir empresa</h1>
          </div>
          <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-6 shadow-sm">
            <p className="font-semibold text-[var(--brand-dark)]">
              Has alcanzado el límite de {quota.max} empresas activas
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">
              Libera un espacio eliminando un proyecto o{" "}
              <Link href="/contact" className="font-semibold text-[var(--brand-primary)] hover:underline">
                contacta con nosotros
              </Link>{" "}
              si necesitas subir más empresas.
            </p>
            <Link
              href={backHref}
              className="mt-5 inline-flex rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            >
              Ver mis empresas
            </Link>
          </div>
        </main>
      );
    }
  }

  return (
    <main className="max-w-6xl mx-auto">
      <SellValuationForm
        variant="dashboard"
        initialEmail={session.user.email}
        initialPhone={session.user.phone ?? ""}
        backHref={backHref}
        eyebrow={eyebrow}
        title="Subir empresa"
      />
    </main>
  );
}
