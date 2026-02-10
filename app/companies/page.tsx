import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import { getUserIdFromSession } from "@/lib/session";
import CompaniesGrid from "@/components/companies/CompaniesGrid";
import { getPublicCompanies } from "@/lib/public-companies";
import { SITE_URL, SITE_NAME, getBreadcrumbSchema } from "@/lib/seo";

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

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const sector = params.sector;
  const sectorLabel = sector ? SECTOR_LABELS[sector] : null;
  const title = sectorLabel
    ? `Empresas en venta en España · ${sectorLabel} | ${SITE_NAME}`
    : `Empresas en venta en España | Marketplace M&A | ${SITE_NAME}`;
  const description =
    sectorLabel
      ? `Oportunidades de adquisición en España, sector ${sectorLabel}. Empresas verificadas en venta en el marketplace líder Diligenz.`
      : "Empresas en venta en España. Explora oportunidades de inversión y compraventa de pymes en el marketplace líder. Regístrate y accede a fichas completas y datos financieros.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: sector ? `${SITE_URL}/companies?sector=${sector}` : `${SITE_URL}/companies`,
      type: "website",
    },
    alternates: {
      canonical: sector ? `${SITE_URL}/companies?sector=${sector}` : `${SITE_URL}/companies`,
    },
  };
}

export default async function CompaniesPage({ searchParams }: Props) {
  const params = await searchParams;
  const sector = params.sector;
  const sectorLabel = sector ? SECTOR_LABELS[sector] : null;

  const { companies, useOnlyReal } = await getPublicCompanies();

  const userId = await getUserIdFromSession();
  const isLoggedIn = Boolean(userId);

  const breadcrumbItems = [
    { name: "Inicio", url: SITE_URL },
    { name: "Empresas en venta", url: `${SITE_URL}/companies` },
    ...(sectorLabel ? [{ name: sectorLabel, url: `${SITE_URL}/companies?sector=${sector}` }] : []),
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
