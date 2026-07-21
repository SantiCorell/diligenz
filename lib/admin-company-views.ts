/** Clasificación admin mutuamente excluyente (una empresa = una casilla). */
export type CompanyAdminViewBucket = "published" | "docs" | "draft";

type CompanyForView = {
  status: string;
  documents: { signed: boolean }[];
  deals: { published: boolean }[];
};

export function companyIsPublished(c: CompanyForView): boolean {
  const deal = c.deals.find((d) => d.published) ?? c.deals[0];
  return Boolean(deal?.published) || c.status === "PUBLISHED";
}

export function companyDocsPending(c: CompanyForView): boolean {
  return c.documents.length === 0 || c.documents.some((d) => !d.signed);
}

/** Sin publicar y con documentación incompleta. */
export function companyInDocsPendingBucket(c: CompanyForView): boolean {
  return !companyIsPublished(c) && companyDocsPending(c);
}

/** Sin publicar y documentación firmada (lista para revisión/publicación). */
export function companyInDraftBucket(c: CompanyForView): boolean {
  return !companyIsPublished(c) && !companyDocsPending(c);
}

export function companyAdminViewBucket(c: CompanyForView): CompanyAdminViewBucket {
  if (companyIsPublished(c)) return "published";
  if (companyDocsPending(c)) return "docs";
  return "draft";
}

export function companyStatusLabel(status: string): string {
  if (status === "DRAFT") return "Borrador";
  if (status === "IN_PROCESS") return "En revisión";
  if (status === "PUBLISHED") return "Publicado";
  if (status === "SOLD") return "Vendido";
  return status;
}
