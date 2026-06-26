/** Duración del destacado manual por admin (14 días). */
export const FEATURED_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export function featuredCutoffDate(now = new Date()): Date {
  return new Date(now.getTime() - FEATURED_DURATION_MS);
}

export function isFeaturedActive(
  featuredAt: Date | string | null | undefined,
  now = new Date()
): boolean {
  if (!featuredAt) return false;
  const at = featuredAt instanceof Date ? featuredAt : new Date(featuredAt);
  if (Number.isNaN(at.getTime())) return false;
  return at.getTime() > featuredCutoffDate(now).getTime();
}

/** Convierte EBITDA almacenado como texto a euros para ordenar (650k €, 1.1M, -50000…). */
export function parseEbitdaEur(value: string | null | undefined): number {
  if (!value || value.trim() === "" || value.trim() === "—") {
    return Number.NEGATIVE_INFINITY;
  }

  let cleaned = value.trim().toLowerCase().replace(/€/g, "").replace(/\s/g, "");
  const negative = cleaned.startsWith("-");
  if (negative) cleaned = cleaned.slice(1);
  cleaned = cleaned.replace(/,/g, ".");

  const parseScaled = (raw: string, suffix: string, multiplier: number): number | null => {
    if (!raw.endsWith(suffix)) return null;
    const n = Number.parseFloat(raw.slice(0, -suffix.length));
    if (!Number.isFinite(n)) return null;
    return (negative ? -1 : 1) * n * multiplier;
  };

  const fromM = parseScaled(cleaned, "m", 1_000_000);
  if (fromM != null) return fromM;

  const fromK = parseScaled(cleaned, "k", 1_000);
  if (fromK != null) return fromK;

  const plain = Number.parseFloat(cleaned);
  if (Number.isFinite(plain)) return negative ? -plain : plain;

  return Number.NEGATIVE_INFINITY;
}

export type CompanyRankingFields = {
  name: string;
  ebitda: string | null | undefined;
  featuredAt?: Date | string | null;
};

export function compareCompaniesForListing(
  a: CompanyRankingFields,
  b: CompanyRankingFields,
  now = new Date()
): number {
  const aFeatured = isFeaturedActive(a.featuredAt, now) ? 1 : 0;
  const bFeatured = isFeaturedActive(b.featuredAt, now) ? 1 : 0;
  if (aFeatured !== bFeatured) return bFeatured - aFeatured;

  const ebitdaDiff = parseEbitdaEur(b.ebitda) - parseEbitdaEur(a.ebitda);
  if (ebitdaDiff !== 0) return ebitdaDiff;

  if (aFeatured && bFeatured && a.featuredAt && b.featuredAt) {
    const aAt = new Date(a.featuredAt).getTime();
    const bAt = new Date(b.featuredAt).getTime();
    if (aAt !== bAt) return bAt - aAt;
  }

  return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
}

export function sortCompaniesForListing<T extends CompanyRankingFields>(
  items: T[],
  now = new Date()
): T[] {
  return [...items].sort((a, b) => compareCompaniesForListing(a, b, now));
}
