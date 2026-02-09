import { prisma } from "@/lib/prisma";
import type { CompanyMock } from "@/lib/mock-companies";

const THRESHOLD_REAL_ONLY = 10;

/**
 * Empresas publicadas en el marketplace (Deal.published = true).
 * Si hay >= THRESHOLD_REAL_ONLY, solo se devuelven reales; si no, se mezclan con mock.
 */
export async function getPublicCompanies(): Promise<{
  companies: CompanyMock[];
  useOnlyReal: boolean;
}> {
  const publishedDeals = await prisma.deal.findMany({
    where: { published: true },
    include: {
      company: {
        include: {
          valuations: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  const realCompanies: CompanyMock[] = publishedDeals.map((deal) => {
    const c = deal.company;
    const val = c.valuations[0];
    const revenueStr = val
      ? `${(val.minValue / 1_000_000).toFixed(1)}–${(val.maxValue / 1_000_000).toFixed(1)}M €`
      : "—";
    const ebitdaStr = c.ebitda ?? "—";
    return {
      id: c.id,
      name: c.name,
      sector: c.sector,
      location: c.location,
      revenue: revenueStr,
      ebitda: ebitdaStr,
      description: c.description ?? "Sin descripción.",
    };
  });

  if (realCompanies.length >= THRESHOLD_REAL_ONLY) {
    return { companies: realCompanies, useOnlyReal: true };
  }

  const { MOCK_COMPANIES } = await import("@/lib/mock-companies");
  const combined = [...MOCK_COMPANIES, ...realCompanies];
  return { companies: combined, useOnlyReal: false };
}
