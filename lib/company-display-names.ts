/** Nombre visible en tarjetas y ficha pública (deal). Nunca filtrar el nombre legal. */
export function publicListingName(
  dealTitle: string | null | undefined,
  /** Solo admin/vendedor pueden pasar el nombre real como fallback consciente. */
  fallback = "Proyecto confidencial"
): string {
  const title = dealTitle?.trim();
  const safe = fallback.trim();
  return title || safe || "Proyecto confidencial";
}
