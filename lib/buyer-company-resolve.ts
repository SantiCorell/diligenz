import { prisma } from "@/lib/prisma";
import type { CompanyMock } from "@/lib/mock-companies";
import { isMockCompanyId } from "@/lib/mock-companies";
import { publicListingName } from "@/lib/company-display-names";

export type ResolvedBuyerCompany = {
  company: CompanyMock | null;
  /** Hay deal publicado: la ficha en /companies/[id] es accesible como en el catálogo */
  published: boolean;
  /** Si no está publicada pero existe en DB, mostrar nombre */
  fallbackName: string | null;
};

/**
 * Resuelve datos de tarjeta para intereses del comprador (mock o empresa real).
 */
export async function resolveCompanyForBuyerInterest(
  companyId: string
): Promise<ResolvedBuyerCompany> {
  if (isMockCompanyId(companyId)) {
    return { company: null, published: false, fallbackName: null };
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        deals: { where: { published: true }, take: 1 },
        valuations: { orderBy: { createdAt: "desc" }, take: 1 },
        companyFiles: {
          where: { kind: "image" },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 12,
          select: { id: true },
        },
      },
    });
    if (!company || company.removedAt) {
      return { company: null, published: false, fallbackName: null };
    }
    const published = company.deals.length > 0;
    const deal = company.deals[0];
    const val = company.valuations[0];
    const imgFiles = company.companyFiles;
    const heroFile = imgFiles[0];
    const galleryImageSrcs =
      imgFiles.length > 1
        ? imgFiles.slice(1).map((f) => `/api/companies/${company.id}/files/${f.id}`)
        : [];
    const cm: CompanyMock = {
      id: company.id,
      name: publicListingName(deal?.title, company.name),
      businessName: company.name,
      sector: company.sector,
      location: company.location,
      revenue: company.revenue?.trim() || company.gmv?.trim() || "—",
      ebitda: company.ebitda ?? "—",
      exerciseResult: company.exerciseResult?.trim() || null,
      gmv: company.gmv ?? null,
      employees: company.employees ?? null,
      description: company.description ?? "Sin descripción.",
      sellerDescription: company.sellerDescription ?? null,
      documentLinks: null,
      attachmentsApproved: company.attachmentsApproved ?? false,
      heroImageSrc: heroFile ? `/api/companies/${company.id}/files/${heroFile.id}` : null,
      galleryImageSrcs,
      valuationSaleMin: val?.salePriceMin ?? null,
      valuationSaleMax: val?.salePriceMax ?? null,
      reference: company.reference ?? null,
    };
    return {
      company: cm,
      published,
      fallbackName: published ? null : company.name,
    };
  } catch {
    return { company: null, published: false, fallbackName: null };
  }
}
