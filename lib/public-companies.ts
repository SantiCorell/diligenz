import { prisma } from "@/lib/prisma";
import type { CompanyMock, DocumentLink } from "@/lib/mock-companies";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

const THRESHOLD_REAL_ONLY = 10;

/**
 * Empresas publicadas en el marketplace (Deal.published = true).
 * Si hay >= THRESHOLD_REAL_ONLY, solo se devuelven reales; si no, se mezclan con mock.
 * Si la DB no está disponible (p. ej. DATABASE_URL no definida), devuelve solo mock.
 */
export async function getPublicCompanies(): Promise<{
  companies: CompanyMock[];
  useOnlyReal: boolean;
}> {
  try {
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
    const c = deal.company as typeof deal.company & {
      gmv?: string | null;
      sellerDescription?: string | null;
      documentLinks?: DocumentLink[] | null;
      attachmentsApproved?: boolean;
    };
    const val = c.valuations[0];
    const revenueStr = val
      ? `${(val.minValue / 1_000_000).toFixed(1)}–${(val.maxValue / 1_000_000).toFixed(1)}M €`
      : "—";
    const ebitdaStr = c.ebitda ?? "—";
    const docLinks = c.documentLinks;
    return {
      id: c.id,
      name: c.name,
      sector: c.sector,
      location: c.location,
      revenue: revenueStr,
      ebitda: ebitdaStr,
      gmv: c.gmv ?? null,
      description: c.description ?? "Sin descripción.",
      sellerDescription: c.sellerDescription ?? null,
      documentLinks: Array.isArray(docLinks) ? docLinks : null,
      attachmentsApproved: c.attachmentsApproved ?? false,
    };
  });

    if (realCompanies.length >= THRESHOLD_REAL_ONLY) {
      return { companies: realCompanies, useOnlyReal: true };
    }
    const combined = [...MOCK_COMPANIES, ...realCompanies];
    return { companies: combined, useOnlyReal: false };
  } catch {
    return { companies: MOCK_COMPANIES, useOnlyReal: false };
  }
}
