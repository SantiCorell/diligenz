import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CompanyMock } from "@/lib/mock-companies";
import { PRIMARY_SECTOR_OPTIONS } from "@/lib/valuation-sectors";
import {
  matchesPrimarySector,
  sectorDbValuesForFilter,
} from "@/lib/sector-visual";
import {
  featuredCutoffDate,
  hasActiveManualFeatured,
  pickHomepageCompanies,
  sortCompaniesForListing,
} from "@/lib/company-ranking";
import { publicListingName } from "@/lib/company-display-names";
import { backfillMissingCompanyReferencesIfNeeded } from "@/lib/company-reference";
import {
  matchesNumericRange,
  parseFinancialAmount,
  type NumericRangeFilter,
} from "@/lib/parse-financial-amount";

const companyPublicInclude = {
  valuations: { orderBy: { createdAt: "desc" as const }, take: 1 },
  companyFiles: {
    where: { kind: "image" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 1,
    select: { id: true },
  },
} satisfies Prisma.CompanyInclude;

type DealWithCompany = Prisma.DealGetPayload<{
  include: { company: { include: typeof companyPublicInclude } };
}>;

function mapDealToMock(deal: DealWithCompany): CompanyMock {
  const c = deal.company;
  const val = c.valuations?.[0];
  const ebitdaStr = c.ebitda ?? "—";
  const exerciseResultStr = (c as { exerciseResult?: string | null }).exerciseResult?.trim() || null;
  const heroFile = c.companyFiles?.[0];
  const heroImageSrc = heroFile ? `/api/companies/${c.id}/files/${heroFile.id}` : null;
  return {
    id: c.id,
    name: publicListingName(deal.title, c.name),
    businessName: c.name,
    sector: c.sector,
    location: c.location,
    revenue: c.revenue?.trim() || "—",
    ebitda: ebitdaStr,
    exerciseResult: exerciseResultStr,
    gmv: (c as { gmv?: string | null }).gmv ?? null,
    employees: c.employees ?? null,
    description: c.description ?? "Sin descripción.",
    sellerDescription: (c as { sellerDescription?: string | null }).sellerDescription ?? null,
    documentLinks: null,
    attachmentsApproved: (c as { attachmentsApproved?: boolean }).attachmentsApproved ?? false,
    companyType: (c as { companyType?: string | null }).companyType ?? null,
    yearsOperating: (c as { yearsOperating?: number | null }).yearsOperating ?? null,
    hasReceivedFunding: (c as { hasReceivedFunding?: boolean | null }).hasReceivedFunding ?? null,
    website: (c as { website?: string | null }).website ?? null,
    heroImageSrc,
    valuationSaleMin: val?.salePriceMin ?? null,
    valuationSaleMax: val?.salePriceMax ?? null,
    reference: (c as { reference?: string | null }).reference ?? null,
  };
}

const DEFAULT_PAGE_SIZE = 12;
const FEATURED_HOME_LIMIT = 6;

async function clearExpiredFeaturedCompanies(): Promise<void> {
  await prisma.company.updateMany({
    where: { featuredAt: { lt: featuredCutoffDate() } },
    data: { featuredAt: null },
  });
}

type RankableDeal = DealWithCompany & {
  company: DealWithCompany["company"] & { featuredAt?: Date | null };
};

function sortDealsByRanking(deals: RankableDeal[]): RankableDeal[] {
  return sortCompaniesForListing(
    deals.map((deal) => ({
      deal,
      name: deal.company.name,
      ebitda: deal.company.ebitda,
      featuredAt: deal.company.featuredAt ?? null,
    }))
  ).map((row) => row.deal);
}

export type GetPublicCompaniesOpts = {
  /** Slug del sector principal (p. ej. tecnologia-software-saas). */
  sector?: string;
  location?: string;
  revenue?: NumericRangeFilter;
  ebitda?: NumericRangeFilter;
  page?: number;
  pageSize?: number;
};

function companyMatchesFilters(company: CompanyMock, opts: GetPublicCompaniesOpts): boolean {
  const { sector, location, revenue, ebitda } = opts;

  if (sector && !matchesPrimarySector(company.sector, sector)) return false;
  if (location && company.location !== location) return false;

  const revenueValue =
    parseFinancialAmount(company.revenue) ?? parseFinancialAmount(company.gmv ?? null);
  if (!matchesNumericRange(revenueValue, revenue)) return false;

  const ebitdaValue = parseFinancialAmount(company.ebitda);
  if (!matchesNumericRange(ebitdaValue, ebitda)) return false;

  return true;
}

function buildPublishedDealsWhere(opts: Pick<GetPublicCompaniesOpts, "sector" | "location">) {
  const { sector, location } = opts;
  const companyWhere = {
    ...(sector ? { sector: { in: sectorDbValuesForFilter(sector) } } : {}),
    ...(location ? { location } : {}),
  };

  return {
    published: true,
    company: {
      removedAt: null,
      ...(Object.keys(companyWhere).length ? companyWhere : {}),
    },
  };
}

/**
 * Empresas publicadas en el marketplace (Deal.published = true).
 * Solo datos reales; sin empresas de demostración.
 */
export async function getPublicCompanies(
  opts: GetPublicCompaniesOpts = {}
): Promise<{
  companies: CompanyMock[];
  useOnlyReal: boolean;
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}> {
  const { sector, location, revenue, ebitda, page = 1, pageSize = DEFAULT_PAGE_SIZE } = opts;
  const skip = (Math.max(1, page) - 1) * pageSize;
  const filterOpts: GetPublicCompaniesOpts = { sector, location, revenue, ebitda };
  const emptyResult = {
    companies: [] as CompanyMock[],
    useOnlyReal: false,
    total: 0,
    totalPages: 1,
    page: Math.max(1, page),
    pageSize,
  };

  try {
    await clearExpiredFeaturedCompanies();
    await backfillMissingCompanyReferencesIfNeeded();

    const baseWhere = buildPublishedDealsWhere({ sector, location });
    const allPublishedDeals = await prisma.deal.findMany({
      where: baseWhere,
      include: {
        company: {
          include: companyPublicInclude,
        },
      },
    });

    const sortedDeals = sortDealsByRanking(allPublishedDeals);
    const filteredDeals = sortedDeals.filter((deal) =>
      companyMatchesFilters(mapDealToMock(deal), filterOpts)
    );
    const totalFiltered = filteredDeals.length;
    const pageDeals = filteredDeals.slice(skip, skip + pageSize);

    return {
      companies: pageDeals.map((deal) => mapDealToMock(deal)),
      useOnlyReal: totalFiltered > 0,
      total: totalFiltered,
      totalPages: Math.max(1, Math.ceil(totalFiltered / pageSize)),
      page: Math.max(1, page),
      pageSize,
    };
  } catch {
    return emptyResult;
  }
}

export type FeaturedCompaniesResult = {
  companies: CompanyMock[];
  /** Hay al menos una destacada manualmente activa (<14 días). */
  hasManualFeatured: boolean;
};

/** Empresas para el carrusel de la home: destacadas activas o, si no hay, mayor EBITDA. */
export async function getFeaturedCompanies(
  limit = FEATURED_HOME_LIMIT
): Promise<FeaturedCompaniesResult> {
  const empty: FeaturedCompaniesResult = { companies: [], hasManualFeatured: false };

  try {
    try {
      await clearExpiredFeaturedCompanies();
    } catch {
      // Entornos sin columna featuredAt migrada aún
    }

    const deals = await prisma.deal.findMany({
      where: {
        published: true,
        company: { removedAt: null },
      },
      include: {
        company: {
          include: companyPublicInclude,
        },
      },
    });

    if (deals.length === 0) return empty;

    const rankable = deals.map((deal) => ({
      id: deal.company.id,
      deal,
      name: deal.company.name,
      ebitda: deal.company.ebitda,
      featuredAt: deal.company.featuredAt ?? null,
    }));

    const hasManualFeatured = hasActiveManualFeatured(rankable);
    const picked = pickHomepageCompanies(rankable, limit);

    return {
      companies: picked.map((row) => mapDealToMock(row.deal)),
      hasManualFeatured,
    };
  } catch {
    return empty;
  }
}

function countByPrimarySector(pool: { sector: string }[]): {
  total: number;
  bySector: Record<string, number>;
} {
  const bySector: Record<string, number> = {};
  for (const s of PRIMARY_SECTOR_OPTIONS) bySector[s.value] = 0;

  for (const item of pool) {
    for (const primary of PRIMARY_SECTOR_OPTIONS) {
      if (matchesPrimarySector(item.sector, primary.value)) {
        bySector[primary.value] += 1;
        break;
      }
    }
  }

  return { total: pool.length, bySector };
}

/** Conteos por sector principal para el filtro hero (respeta ubicación si se indica). */
export async function getPrimarySectorCounts(
  opts: { location?: string } = {}
): Promise<{ total: number; bySector: Record<string, number> }> {
  const { location } = opts;
  const emptyCounts = Object.fromEntries(
    PRIMARY_SECTOR_OPTIONS.map((sector) => [sector.value, 0])
  ) as Record<string, number>;

  try {
    const rows = await prisma.company.findMany({
      where: {
        removedAt: null,
        ...(location ? { location } : {}),
        deals: { some: { published: true } },
      },
      select: { sector: true },
    });

    return countByPrimarySector(rows);
  } catch {
    return { total: 0, bySector: emptyCounts };
  }
}

/** Ubicaciones distintas de empresas publicadas (para filtro en listado). */
export async function getDistinctLocations(): Promise<string[]> {
  try {
    const rows = await prisma.company.findMany({
      where: { removedAt: null, deals: { some: { published: true } } },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    });
    return rows.map((r) => r.location).filter(Boolean);
  } catch {
    return [];
  }
}
