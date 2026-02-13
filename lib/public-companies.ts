import { prisma } from "@/lib/prisma";
import type { CompanyMock, DocumentLink } from "@/lib/mock-companies";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

const THRESHOLD_REAL_ONLY = 10;

function mapDealToMock(
  deal: Awaited<ReturnType<typeof prisma.deal.findMany>>[number] & {
    company: { valuations: { minValue: number; maxValue: number }[] } & Record<string, unknown>;
  }
): CompanyMock {
  const c = deal.company as typeof deal.company & {
    gmv?: string | null;
    sellerDescription?: string | null;
    documentLinks?: DocumentLink[] | null;
    attachmentsApproved?: boolean;
    companyType?: string | null;
    yearsOperating?: number | null;
    hasReceivedFunding?: boolean | null;
    website?: string | null;
  };
  const val = c.valuations?.[0];
  const revenueStr = val
    ? `${(val.minValue / 1_000_000).toFixed(1)}–${(val.maxValue / 1_000_000).toFixed(1)}M €`
    : "—";
  const ebitdaStr = (c as { ebitda?: string | null }).ebitda ?? "—";
  const docLinks = c.documentLinks;
  return {
    id: c.id,
    name: c.name,
    sector: c.sector,
    location: c.location,
    revenue: revenueStr,
    ebitda: ebitdaStr,
    gmv: c.gmv ?? null,
    employees: c.employees ?? null,
    description: c.description ?? "Sin descripción.",
    sellerDescription: c.sellerDescription ?? null,
    documentLinks: Array.isArray(docLinks) ? docLinks : null,
    attachmentsApproved: c.attachmentsApproved ?? false,
    companyType: c.companyType ?? null,
    yearsOperating: c.yearsOperating ?? null,
    hasReceivedFunding: c.hasReceivedFunding ?? null,
    website: c.website ?? null,
  };
}

const DEFAULT_PAGE_SIZE = 12;

export type GetPublicCompaniesOpts = {
  sector?: string;
  location?: string;
  page?: number;
  pageSize?: number;
};

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
      ...(sector ? { sector } : {}),
      ...(location ? { location } : {}),
    };
    const baseWhere = {
      published: true,
      ...(Object.keys(companyWhere).length ? { company: companyWhere } : {}),
    };

    const total = await prisma.deal.count({ where: baseWhere });

    if (total >= THRESHOLD_REAL_ONLY) {
      const publishedDeals = await prisma.deal.findMany({
        where: baseWhere,
        include: {
          company: {
            include: {
              valuations: { orderBy: { createdAt: "desc" }, take: 1 },
            },
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
          include: {
            valuations: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { company: { name: "asc" } },
    });
    const realCompanies: CompanyMock[] = allDeals.map((deal) => mapDealToMock(deal));
    // Pocas empresas reales: mezclar con mock, filtrar y paginar en memoria
    const combined = [...MOCK_COMPANIES, ...realCompanies];
    const filtered = combined.filter((c) => {
      if (sector && c.sector !== sector) return false;
      if (location && c.location !== location) return false;
      return true;
    });
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

/** Ubicaciones distintas de empresas publicadas (para filtro en listado). */
export async function getDistinctLocations(): Promise<string[]> {
  try {
    const rows = await prisma.company.findMany({
      where: { deals: { some: { published: true } } },
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
