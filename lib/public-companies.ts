import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CompanyMock } from "@/lib/mock-companies";
import { MOCK_COMPANIES } from "@/lib/mock-companies";
import { formatCompactEuroRange } from "@/lib/format-financial";
import { PRIMARY_SECTOR_OPTIONS } from "@/lib/valuation-sectors";
import {
  matchesPrimarySector,
  resolveSectorKey,
  sectorDbValuesForFilter,
} from "@/lib/sector-visual";

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
  const revenueStr = val ? formatCompactEuroRange(val.minValue, val.maxValue) : "—";
  const ebitdaStr = c.ebitda ?? "—";
  const exerciseResultStr = (c as { exerciseResult?: string | null }).exerciseResult?.trim() || null;
  const heroFile = c.companyFiles?.[0];
  const heroImageSrc = heroFile ? `/api/companies/${c.id}/files/${heroFile.id}` : null;
  return {
    id: c.id,
    name: c.name,
    sector: c.sector,
    location: c.location,
    revenue: revenueStr,
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
  };
}

const DEFAULT_PAGE_SIZE = 12;

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
      const publishedDeals = await prisma.deal.findMany({
        where: baseWhere,
        include: {
          company: {
            include: companyPublicInclude,
          },
        },
        orderBy: { company: { name: "asc" } },
        skip,
        take: pageSize,
      });
      const realCompanies: CompanyMock[] = publishedDeals.map((deal) => mapDealToMock(deal));
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
      orderBy: { company: { name: "asc" } },
    });
    const realCompanies: CompanyMock[] = allDeals.map((deal) => mapDealToMock(deal));
    // Pocas empresas reales: mezclar con mock, filtrar y paginar en memoria
    const combined = [...MOCK_COMPANIES, ...realCompanies];
    const filtered = combined.filter((c) => companyMatchesFilters(c, sector, location));
    const totalMixed = filtered.length;
    const totalPagesMixed = Math.max(1, Math.ceil(totalMixed / pageSize));
    const paginated = filtered.slice(skip, skip + pageSize);
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
