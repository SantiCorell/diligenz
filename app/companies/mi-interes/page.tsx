import { redirect } from "next/navigation";
import Link from "next/link";
import { MOCK_COMPANIES } from "@/lib/mock-companies";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";
import CompanyCard from "@/components/companies/CompanyCard";

export default async function MiInteresPage() {
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/login?from=/companies/mi-interes");

  const interests = await prisma.userCompanyInterest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const companyIds = [...new Set(interests.map((i) => i.companyId))];
  const companies = MOCK_COMPANIES.filter((c) => companyIds.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[var(--brand-primary)]">
        De mi interés
      </h1>
      <p className="mt-3 text-[var(--foreground)] opacity-90 max-w-2xl">
        Empresas a las que has solicitado información o guardado en seguimiento.
      </p>

      {companies.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] p-8 text-center">
          <p className="text-[var(--foreground)] opacity-85">
            Aún no tienes empresas en tu lista. Explora el catálogo y haz clic en
            &quot;Solicitar información&quot; o &quot;Guardar en seguimiento&quot; en cualquier ficha.
          </p>
          <Link
            href="/companies"
            className="mt-6 inline-block rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Ver empresas
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isLoggedIn
              linkToFicha
            />
          ))}
        </div>
      )}
    </div>
  );
}
