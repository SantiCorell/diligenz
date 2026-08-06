import { prisma } from "@/lib/prisma";
import type { CompanyMock } from "@/lib/mock-companies";
import { isMockCompanyId } from "@/lib/mock-companies";
import { publicListingName } from "@/lib/company-display-names";

export type ResolvedBuyerCompany = {
  company: CompanyMock | null;
  /** Hay deal publicado: la ficha en /companies/[id] es accesible como en el catálogo */
  published: boolean;
  /** Si no está publicada, nombre público seguro para listados del comprador */
  fallbackName: string | null;
};

/**
 * Resuelve datos de tarjeta para intereses del comprador (mock o empresa real).
 * Nunca expone Company.name (nombre real) al comprador.
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
        deals: {
          orderBy: [{ published: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: { title: true, published: true },
        },
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
    const deal = company.deals[0];
    const published = Boolean(deal?.published);
    const listingName = publicListingName(deal?.title);
    const val = company.valuations[0];
    const imgFiles = company.companyFiles;
    const heroFile = imgFiles[0];
    const galleryImageSrcs =
      imgFiles.length > 1
        ? imgFiles.slice(1).map((f) => `/api/companies/${company.id}/files/${f.id}`)
        : [];
    const cm: CompanyMock = {
      id: company.id,
      name: listingName,
      sector: company.sector,
      location: company.location,
      revenue: company.revenue?.trim() || company.gmv?.trim() || "—",
      ebitda: company.ebitda ?? "—",
      exerciseResult: company.exerciseResult?.trim() || null,
      gmv: company.gmv ?? null,
      employees: company.employees ?? null,
      description: company.description ?? "Sin descripción.",
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
      fallbackName: published ? null : listingName,
    };
  } catch {
    return { company: null, published: false, fallbackName: null };
  }
}
