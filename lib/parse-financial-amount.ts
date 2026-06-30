/** Convierte textos de facturación/EBITDA (ej. "2.5M", "850K", "-120000") a euros. */
export function parseFinancialAmount(raw: string | null | undefined): number | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;

  const negative = trimmed.startsWith("-");
  const value = negative ? trimmed.slice(1).trim() : trimmed;
  const suffixMatch = value.match(/^(.+?)\s*([kKmM])$/);
  const numericPart = suffixMatch ? suffixMatch[1] : value;
  const suffix = suffixMatch?.[2]?.toLowerCase();

  const digitsOnly = numericPart.replace(/\s/g, "");
  let parsed: number | null = null;

  if (/^\d+$/.test(digitsOnly)) {
    const asInt = Number.parseInt(digitsOnly, 10);
    parsed = Number.isFinite(asInt) ? asInt : null;
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(digitsOnly)) {
    const asInt = Number.parseInt(digitsOnly.replace(/\./g, ""), 10);
    parsed = Number.isFinite(asInt) ? asInt : null;
  } else if (/^\d{1,3}(?:,\d{3})+$/.test(digitsOnly)) {
    const asInt = Number.parseInt(digitsOnly.replace(/,/g, ""), 10);
    parsed = Number.isFinite(asInt) ? asInt : null;
  } else {
    const normalized = digitsOnly.includes(",") && !digitsOnly.includes(".")
      ? digitsOnly.replace(",", ".")
      : digitsOnly.replace(/\./g, "").replace(",", ".");
    const asFloat = Number.parseFloat(normalized);
    parsed = Number.isFinite(asFloat) ? asFloat : null;
  }

  if (parsed == null) return null;

  if (suffix === "m") parsed *= 1_000_000;
  if (suffix === "k") parsed *= 1_000;

  return negative ? -parsed : parsed;
}

export type NumericRangeFilter = {
  min?: number;
  max?: number;
};

export function matchesNumericRange(
  value: number | null | undefined,
  range?: NumericRangeFilter
): boolean {
  if (range?.min == null && range?.max == null) return true;
  if (value == null) return false;
  if (range.min != null && value < range.min) return false;
  if (range.max != null && value > range.max) return false;
  return true;
}
