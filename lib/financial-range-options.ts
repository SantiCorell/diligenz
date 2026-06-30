import { formatEuroAmount } from "@/lib/format-financial";

export const FINANCIAL_MAX_FLOOR = 5_000_000;

/** Importes para el mínimo (siempre por debajo del techo de máximo en catálogo). */
export const FINANCIAL_MIN_AMOUNTS = [
  10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 4_000_000,
] as const;

/** Importes para el máximo: siempre 5 M€ o más. */
export const FINANCIAL_MAX_AMOUNTS = [
  5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000,
] as const;

export type FinancialRangeOption = { value: string; label: string };

function parseAmount(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatFinancialAmountLabel(amount: number): string {
  return formatEuroAmount(amount);
}

function withLegacyOption(
  selectedValue: string,
  options: FinancialRangeOption[]
): FinancialRangeOption[] {
  if (!selectedValue || options.some((o) => o.value === selectedValue)) return options;
  const parsed = parseAmount(selectedValue);
  if (parsed == null) return options;
  return [...options, { value: selectedValue, label: formatFinancialAmountLabel(parsed) }];
}

export function getFinancialMinOptions(
  minValue: string,
  maxValue: string
): FinancialRangeOption[] {
  const max = parseAmount(maxValue);
  const amounts = FINANCIAL_MIN_AMOUNTS.filter((amount) => max == null || amount < max);
  const options: FinancialRangeOption[] = [
    { value: "", label: "Mín." },
    ...amounts.map((amount) => ({
      value: String(amount),
      label: formatFinancialAmountLabel(amount),
    })),
  ];
  return withLegacyOption(minValue, options);
}

export function getFinancialMaxOptions(
  minValue: string,
  maxValue: string
): FinancialRangeOption[] {
  const min = parseAmount(minValue);
  const floor = min != null ? Math.max(min, FINANCIAL_MAX_FLOOR) : FINANCIAL_MAX_FLOOR;
  const amounts = FINANCIAL_MAX_AMOUNTS.filter((amount) => amount >= floor);
  const options: FinancialRangeOption[] = [
    { value: "", label: "Máx." },
    ...amounts.map((amount) => ({
      value: String(amount),
      label: formatFinancialAmountLabel(amount),
    })),
  ];
  return withLegacyOption(maxValue, options);
}

/** Ajusta min/máx para que min < máx y el máx sea ≥ 5 M€ si está definido. */
export function reconcileFinancialRange(
  minValue: string,
  maxValue: string,
  changed: "min" | "max"
): { min: string; max: string } {
  let min = minValue;
  let max = maxValue;

  const minAmount = parseAmount(min);
  let maxAmount = parseAmount(max);

  if (maxAmount != null && maxAmount < FINANCIAL_MAX_FLOOR) {
    max = "";
    maxAmount = null;
  }

  if (changed === "min") {
    if (minAmount != null && maxAmount != null && minAmount >= maxAmount) {
      max = "";
    }
    return { min, max };
  }

  if (minAmount != null && maxAmount != null && minAmount >= maxAmount) {
    min = "";
  }

  return { min, max };
}

export function sanitizeFinancialMaxParam(value?: string): string {
  if (!value?.trim()) return "";
  const parsed = parseAmount(value);
  if (parsed == null || parsed < FINANCIAL_MAX_FLOOR) return "";
  return value;
}
