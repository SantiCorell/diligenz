/** Clasificación admin mutuamente excluyente (una empresa = una casilla). */
export type CompanyAdminViewBucket = "published" | "review" | "draft";

type CompanyForView = {
  status: string;
  deals: { published: boolean }[];
};

/** Visible en marketplace (deal publicado). */
export function companyIsPublishedOnWeb(c: CompanyForView): boolean {
  const deal = c.deals.find((d) => d.published) ?? c.deals[0];
  return Boolean(deal?.published);
}

/** Estado operativo DRAFT (borrador), sin estar ya en la web. */
export function companyInDraftBucket(c: CompanyForView): boolean {
  if (companyIsPublishedOnWeb(c)) return false;
  return c.status === "DRAFT";
}

/** En revisión interna (IN_PROCESS), aún no publicada en web. */
export function companyInReviewBucket(c: CompanyForView): boolean {
  if (companyIsPublishedOnWeb(c)) return false;
  return c.status === "IN_PROCESS";
}

export function companyAdminViewBucket(c: CompanyForView): CompanyAdminViewBucket | null {
  if (companyIsPublishedOnWeb(c)) return "published";
  if (c.status === "DRAFT") return "draft";
  if (c.status === "IN_PROCESS") return "review";
  return null;
}

export function companyStatusLabel(status: string): string {
  if (status === "DRAFT") return "Borrador";
  if (status === "IN_PROCESS") return "En revisión";
  if (status === "PUBLISHED") return "Publicado";
  if (status === "SOLD") return "Vendido";
  return status;
}
