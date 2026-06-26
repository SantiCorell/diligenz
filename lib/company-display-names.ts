/** Nombre visible en tarjetas y ficha pública (deal). */
export function publicListingName(
  dealTitle: string | null | undefined,
  companyName: string
): string {
  const title = dealTitle?.trim();
  return title || companyName.trim() || "Proyecto confidencial";
}
