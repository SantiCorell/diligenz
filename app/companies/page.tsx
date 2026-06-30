import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import { getUserIdFromSession } from "@/lib/session";
import CompaniesGrid from "@/components/companies/CompaniesGrid";
import {
  getPublicCompanies,
  getPrimarySectorCounts,
} from "@/lib/public-companies";
import {
  parseFilterInt,
  resolveCompaniesFiltersFromSearchParams,
} from "@/lib/companies-filter-defaults";
import { PRIMARY_SECTOR_OPTIONS, CATALOG_SECTOR_OPTIONS } from "@/lib/valuation-sectors";
import { SITE_URL, SITE_NAME, getBreadcrumbSchema } from "@/lib/seo";
import { catalogSectorLabelsRecord } from "@/lib/valuation-sectors";
import { getUserFavoriteCompanyIds } from "@/lib/company-favorites";

const SECTOR_LABELS = catalogSectorLabelsRecord();

type Props = {
  searchParams: Promise<{
    sector?: string;
    location?: string;
    page?: string;
    revenueMin?: string;
    revenueMax?: string;
    ebitdaMin?: string;
    ebitdaMax?: string;
  }>;
};

function parseOptionalInt(param?: string): number | undefined {
  return parseFilterInt(param);
}

const DETAIL_SECTOR_OPTIONS = CATALOG_SECTOR_OPTIONS.filter((option) => option.value !== "").map(
  (option) => ({
    value: option.value,
    label: option.label.replace(" (histórico)", ""),
  })
);

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
  const filtersFromUrl = resolveCompaniesFiltersFromSearchParams(params);
  const sectorSlug = filtersFromUrl.sector || undefined;
  const location = filtersFromUrl.location;

  const sectorLabel = sectorSlug ? SECTOR_LABELS[sectorSlug] : null;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const pageSize = 12;

  const [result, sectorCountsResult] = await Promise.all([
    getPublicCompanies({
      sector: sectorSlug,
      location: location || undefined,
      revenue: {
        min: parseOptionalInt(filtersFromUrl.revenueMin),
        max: parseOptionalInt(filtersFromUrl.revenueMax),
      },
      ebitda: {
        min: parseOptionalInt(filtersFromUrl.ebitdaMin),
        max: parseOptionalInt(filtersFromUrl.ebitdaMax),
      },
      page,
      pageSize,
    }),
    getPrimarySectorCounts({ location: location || undefined }),
  ]);
  const { companies, useOnlyReal, total, totalPages } = result;
  const { total: catalogTotal, bySector: sectorCounts } = sectorCountsResult;
  const activeSectorLabel = sectorSlug
    ? PRIMARY_SECTOR_OPTIONS.find((s) => s.value === sectorSlug)?.shortLabel ?? sectorLabel
    : null;

  const userId = await getUserIdFromSession();
  const isLoggedIn = Boolean(userId);
  const favoriteCompanyIds = userId ? await getUserFavoriteCompanyIds(userId) : [];

  const breadcrumbItems = [
    { name: "Inicio", url: SITE_URL },
    { name: "Empresas en venta", url: `${SITE_URL}/companies` },
    ...(sectorLabel ? [{ name: sectorLabel, url: `${SITE_URL}/companies?sector=${sectorSlug}` }] : []),
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="relative px-4 py-6 sm:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 md:mb-8">
            <p className="page-eyebrow">Marketplace M&A</p>
            <h1 className="page-title mt-1">
              Empresas en venta
              {activeSectorLabel && (
                <span className="text-[var(--foreground)]/55 font-medium"> · {activeSectorLabel}</span>
              )}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--foreground)]/70 max-w-2xl leading-relaxed">
              Oportunidades verificadas de adquisición en España. Filtra por sector, ubicación, facturación y EBITDA, y accede a la ficha completa al registrarte.
            </p>
            {useOnlyReal && (
              <p className="mt-2 inline-flex items-center rounded-full border border-[var(--brand-primary)]/15 bg-[var(--brand-primary)]/[0.06] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
                Catálogo con empresas reales publicadas
              </p>
            )}
          </header>

          <CompaniesGrid
            companies={companies}
            isLoggedIn={isLoggedIn}
            favoriteCompanyIds={favoriteCompanyIds}
            filtersFromUrl={filtersFromUrl}
            sectorOptions={DETAIL_SECTOR_OPTIONS}
            total={total}
            totalPages={totalPages}
            currentPage={page}
            pageSize={pageSize}
            sectorCounts={sectorCounts}
            catalogTotal={catalogTotal}
          />
        </div>
      </div>
    </ShellLayout>
  );
}
