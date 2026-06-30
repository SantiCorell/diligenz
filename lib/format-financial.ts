import { parseFinancialAmount } from "@/lib/parse-financial-amount";

function compactMillionDecimals(millions: number): number {
  if (millions >= 10) return Number.isInteger(millions) ? 0 : 1;
  return 2;
}

/** Importe compacto sin símbolo € (p. ej. `180k`, `1,25M`). */
export function formatCompactAmountValue(value: number): string {
  const sign = value < 0 ? "-" : "";
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    const millions = absValue / 1_000_000;
    return `${sign}${millions.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: compactMillionDecimals(millions),
    })}M`;
  }

  if (absValue >= 1_000) {
    const thousands = Math.round(absValue / 1_000);
    return `${sign}${thousands.toLocaleString("es-ES")}k`;
  }

  return `${sign}${Math.round(absValue).toLocaleString("es-ES")}`;
}

/** Importe compacto con € pegado: `180k€`, `1,25M€`. */
export function formatCompactEuro(value: number): string {
  const sign = value < 0 ? "-" : "";
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    const millions = absValue / 1_000_000;
    return `${sign}${millions.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: compactMillionDecimals(millions),
    })}M€`;
  }

  if (absValue >= 1_000) {
    const thousands = Math.round(absValue / 1_000);
    return `${sign}${thousands.toLocaleString("es-ES")}k€`;
  }

  return `${sign}${Math.round(absValue).toLocaleString("es-ES")}€`;
}

/** Importe completo en español: `1.250.000 €`. */
export function formatFullEuro(value: number): string {
  return `${value.toLocaleString("es-ES")} €`;
}

/** Formato habitual en ficha y tarjetas: compacto desde 1.000 €. */
export function formatEuroAmount(value: number): string {
  if (Math.abs(value) >= 1_000) return formatCompactEuro(value);
  return formatFullEuro(value);
}

export function formatEuroAmountFromString(raw: string | number | null | undefined): string {
  if (raw == null) return "—";
  if (typeof raw === "number") return formatEuroAmount(raw);

  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return "—";

  const digitsOnly = trimmed.replace(/\s/g, "");
  if (/^-?\d+$/.test(digitsOnly)) {
    return formatEuroAmount(Number.parseInt(digitsOnly, 10));
  }

  const rangeMatch = trimmed.match(/^(.+?)\s*[–—-]\s*(.+?)(?:\s*€)?$/);
  if (rangeMatch) {
    const min = parseFinancialAmount(rangeMatch[1]);
    const max = parseFinancialAmount(rangeMatch[2]);
    if (min != null && max != null) {
      return formatEuroRange(min, max) ?? trimmed;
    }
  }

  const parsed = parseFinancialAmount(trimmed);
  if (parsed != null) return formatEuroAmount(parsed);

  return trimmed.includes("€") ? trimmed : `${trimmed} €`;
}

export function formatEuroRange(
  min: number | null | undefined,
  max: number | null | undefined
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) {
    if (min === max) return formatEuroAmount(min);
    return `${formatEuroAmount(min)} – ${formatEuroAmount(max)}`;
  }
  return formatEuroAmount(min ?? max!);
}

export function formatCompactEuroRange(minValue: number, maxValue: number): string {
  return formatEuroRange(minValue, maxValue) ?? "—";
}
