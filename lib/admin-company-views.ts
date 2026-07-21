/** Clasificación admin mutuamente excluyente (una empresa = una casilla). */
export type CompanyAdminViewBucket = "published" | "review" | "draft";

type CompanyForView = {
  status: string;
  deals: { published: boolean }[];
  documents?: { signed: boolean }[];
};

/** Visible en marketplace (deal publicado). */
export function companyIsPublishedOnWeb(c: CompanyForView): boolean {
  const deal = c.deals.find((d) => d.published) ?? c.deals[0];
  return Boolean(deal?.published);
}

/** Documentación incompleta (misma regla que el chip «Docs pend.» en listado). */
export function companyHasPendingDocs(c: CompanyForView): boolean {
  const docs = c.documents ?? [];
  if (docs.length === 0) return true;
  return docs.some((d) => !d.signed);
}

/** Estado operativo DRAFT (borrador), sin estar ya en la web. */
export function companyInDraftBucket(c: CompanyForView): boolean {
  if (companyIsPublishedOnWeb(c)) return false;
  return c.status === "DRAFT";
}

/** En revisión interna o publicada en web con documentación pendiente. */
export function companyInReviewBucket(c: CompanyForView): boolean {
  if (c.status === "IN_PROCESS") return true;
  if (companyIsPublishedOnWeb(c) && companyHasPendingDocs(c)) return true;
  return false;
}

/** Publicada en web con documentación al día. */
export function companyInPublishedBucket(c: CompanyForView): boolean {
  return companyIsPublishedOnWeb(c) && !companyInReviewBucket(c);
}

export function companyAdminViewBucket(c: CompanyForView): CompanyAdminViewBucket | null {
  if (companyInDraftBucket(c)) return "draft";
  if (companyInReviewBucket(c)) return "review";
  if (companyInPublishedBucket(c)) return "published";
  return null;
}

export function companyStatusLabel(status: string): string {
  if (status === "DRAFT") return "Borrador";
  if (status === "IN_PROCESS") return "En revisión";
  if (status === "PUBLISHED") return "Publicado";
  if (status === "SOLD") return "Vendido";
  return status;
}
