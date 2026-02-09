import { cookies } from "next/headers";
import ShellLayout from "@/components/layout/ShellLayout";
import CompaniesGrid from "@/components/companies/CompaniesGrid";
import { getPublicCompanies } from "@/lib/public-companies";

const SECTOR_LABELS: Record<string, string> = {
  salud: "Salud",
  tecnologia: "Tecnología",
  industria: "Industria",
  consumo: "Consumo",
  energia: "Energía",
  logistica: "Logística",
};

type Props = {
  searchParams: Promise<{ sector?: string }>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const params = await searchParams;
  const sector = params.sector;
  const sectorLabel = sector ? SECTOR_LABELS[sector] : null;

  const { companies, useOnlyReal } = await getPublicCompanies();

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const isLoggedIn = Boolean(session?.value);

  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--brand-primary)]">
              Empresas en venta
              {sectorLabel && (
                <span className="opacity-70"> · {sectorLabel}</span>
              )}
            </h1>
            <p className="mt-3 text-[var(--foreground)] opacity-90 max-w-2xl">
              Explora empresas disponibles y oportunidades activas de adquisición.
              Regístrate para ver la ficha completa y datos financieros.
            </p>
            {useOnlyReal && (
              <p className="mt-2 text-sm text-[var(--foreground)] opacity-75">
                Mostrando solo empresas reales publicadas en el marketplace.
              </p>
            )}
          </div>

          <CompaniesGrid
            companies={companies}
            isLoggedIn={isLoggedIn}
            sectorFromUrl={sectorLabel ?? undefined}
          />
        </div>
      </div>
    </ShellLayout>
  );
}
