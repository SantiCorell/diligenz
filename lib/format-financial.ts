export function formatCompactAmountValue(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000) {
    const millions = absValue / 1_000_000;
    const decimals = millions >= 10 || Number.isInteger(millions) ? 0 : 1;
    return `${sign}${millions.toFixed(decimals).replace(/\.0$/, "")}M`;
  }

  if (absValue >= 1_000) {
    const thousands = Math.round(absValue / 1_000);
    return `${sign}${thousands}K`;
  }

  return `${sign}${Math.round(absValue)}`;
}

export function formatCompactEuroRange(minValue: number, maxValue: number): string {
  return `${formatCompactAmountValue(minValue)}–${formatCompactAmountValue(maxValue)} €`;
}
