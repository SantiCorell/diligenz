import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CompanyMock } from "@/lib/mock-companies";
import { MOCK_COMPANIES } from "@/lib/mock-companies";
import { PRIMARY_SECTOR_OPTIONS } from "@/lib/valuation-sectors";
import {
  matchesPrimarySector,
  resolveSectorKey,
  sectorDbValuesForFilter,
} from "@/lib/sector-visual";
import {
  featuredCutoffDate,
  sortCompaniesForListing,
} from "@/lib/company-ranking";
import { publicListingName } from "@/lib/company-display-names";
import { backfillMissingCompanyReferencesIfNeeded } from "@/lib/company-reference";

const THRESHOLD_REAL_ONLY = 10;

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
    // Enlaces Drive: solo en ficha /companies/[id] y solo para propietario o admin (no en listado).
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
  page?: number;
  pageSize?: number;
};

function companyMatchesFilters(
  company: CompanyMock,
  sector?: string,
  location?: string
): boolean {
  if (sector && !matchesPrimarySector(company.sector, sector)) return false;
  if (location && company.location !== location) return false;
  return true;
}

/**
 * Empresas publicadas en el marketplace (Deal.published = true).
 * Si hay >= THRESHOLD_REAL_ONLY, solo se devuelven reales con paginación; si no, se mezclan con mock.
 * Si la DB no está disponible, devuelve solo mock (sin paginación).
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
  const { sector, location, page = 1, pageSize = DEFAULT_PAGE_SIZE } = opts;
  const skip = (Math.max(1, page) - 1) * pageSize;

  try {
    await clearExpiredFeaturedCompanies();
    await backfillMissingCompanyReferencesIfNeeded();

    const companyWhere = {
      ...(sector ? { sector: { in: sectorDbValuesForFilter(sector) } } : {}),
      ...(location ? { location } : {}),
    };
    const baseWhere = {
      published: true,
      company: {
        removedAt: null,
        ...(Object.keys(companyWhere).length ? companyWhere : {}),
      },
    };

    const total = await prisma.deal.count({ where: baseWhere });

    if (total >= THRESHOLD_REAL_ONLY) {
      const allPublishedDeals = await prisma.deal.findMany({
        where: baseWhere,
        include: {
          company: {
            include: companyPublicInclude,
          },
        },
      });
      const sortedDeals = sortDealsByRanking(allPublishedDeals);
      const pageDeals = sortedDeals.slice(skip, skip + pageSize);
      const realCompanies: CompanyMock[] = pageDeals.map((deal) => mapDealToMock(deal));
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      return {
        companies: realCompanies,
        useOnlyReal: true,
        total,
        totalPages,
        page: Math.max(1, page),
        pageSize,
      };
    }

    const allDeals = await prisma.deal.findMany({
      where: baseWhere,
      include: {
        company: {
          include: companyPublicInclude,
        },
      },
    });
    const realCompanies: CompanyMock[] = sortDealsByRanking(allDeals).map((deal) =>
      mapDealToMock(deal)
    );
    // Pocas empresas reales: mezclar con mock, filtrar y paginar en memoria
    const combined = [...MOCK_COMPANIES, ...realCompanies];
    const filtered = combined.filter((c) => companyMatchesFilters(c, sector, location));
    const sortedFiltered = sortCompaniesForListing(
      filtered.map((company) => ({
        company,
        name: company.name,
        ebitda: company.ebitda,
        featuredAt: null,
      }))
    ).map((row) => row.company);
    const totalMixed = sortedFiltered.length;
    const totalPagesMixed = Math.max(1, Math.ceil(totalMixed / pageSize));
    const paginated = sortedFiltered.slice(skip, skip + pageSize);
    return {
      companies: paginated,
      useOnlyReal: false,
      total: totalMixed,
      totalPages: totalPagesMixed,
      page: Math.max(1, page),
      pageSize,
    };
  } catch {
    const total = MOCK_COMPANIES.length;
    const totalPages = 1;
    return {
      companies: MOCK_COMPANIES,
      useOnlyReal: false,
      total,
      totalPages,
      page: 1,
      pageSize,
    };
  }
}

/** Empresas para el carrusel de la home: publicadas, orden por destacado + EBITDA. */
export async function getFeaturedCompanies(
  limit = FEATURED_HOME_LIMIT
): Promise<CompanyMock[]> {
  try {
    await clearExpiredFeaturedCompanies();

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

    if (deals.length === 0) {
      return sortCompaniesForListing(
        MOCK_COMPANIES.map((company) => ({
          company,
          name: company.name,
          ebitda: company.ebitda,
          featuredAt: null,
        }))
      )
        .map((row) => row.company)
        .slice(0, limit);
    }

    if (deals.length < THRESHOLD_REAL_ONLY) {
      const realCompanies = sortDealsByRanking(deals).map((deal) => mapDealToMock(deal));
      const combined = sortCompaniesForListing(
        [...MOCK_COMPANIES, ...realCompanies].map((company) => ({
          company,
          name: company.name,
          ebitda: company.ebitda,
          featuredAt: null,
        }))
      ).map((row) => row.company);
      return combined.slice(0, limit);
    }

    return sortDealsByRanking(deals)
      .slice(0, limit)
      .map((deal) => mapDealToMock(deal));
  } catch {
    return sortCompaniesForListing(
      MOCK_COMPANIES.map((company) => ({
        company,
        name: company.name,
        ebitda: company.ebitda,
        featuredAt: null,
      }))
    )
      .map((row) => row.company)
      .slice(0, limit);
  }
}

function countByPrimarySector(pool: { sector: string }[]): {
  total: number;
  bySector: Record<string, number>;
} {
  const bySector: Record<string, number> = {};
  for (const s of PRIMARY_SECTOR_OPTIONS) bySector[s.value] = 0;

  for (const item of pool) {
    const key = resolveSectorKey(item.sector);
    const primary = PRIMARY_SECTOR_OPTIONS.find((s) => s.value === key);
    if (primary) bySector[primary.value] += 1;
  }

  return { total: pool.length, bySector };
}

/** Conteos por sector principal para el filtro hero (respeta ubicación si se indica). */
export async function getPrimarySectorCounts(
  opts: { location?: string } = {}
): Promise<{ total: number; bySector: Record<string, number> }> {
  const { location } = opts;

  try {
    const rows = await prisma.company.findMany({
      where: {
        removedAt: null,
        ...(location ? { location } : {}),
        deals: { some: { published: true } },
      },
      select: { sector: true, location: true },
    });

    if (rows.length >= THRESHOLD_REAL_ONLY) {
      return countByPrimarySector(rows);
    }

    const realMocks: CompanyMock[] = rows.map((r, i) => ({
      ...MOCK_COMPANIES[0],
      id: `real-count-${i}`,
      sector: r.sector,
      location: r.location,
    }));
    const pool = [
      ...MOCK_COMPANIES.filter((c) => !location || c.location === location),
      ...realMocks.filter((c) => !location || c.location === location),
    ];
    return countByPrimarySector(pool);
  } catch {
    const pool = MOCK_COMPANIES.filter((c) => !location || c.location === location);
    return countByPrimarySector(pool);
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
    const set = new Set(MOCK_COMPANIES.map((c) => c.location).filter(Boolean));
    return Array.from(set).sort();
  }
}
