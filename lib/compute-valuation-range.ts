/**
 * Valoración orientativa por múltiplos de sector.
 * - Con EBITDA positivo: múltiplo sobre EBITDA (más fiable).
 * - Sin EBITDA o EBITDA negativo / cero: múltiplo sobre facturación.
 * - companyType STARTUP/MARKETPLACE: se usa revenue (o ARR si se indica); EBITDA negativo permitido.
 * EMPRESA y AUTONOMO se tratan como negocio tradicional (no startup).
 */
export function computeValuationRange(body: {
  sector: string;
  revenue: number;
  ebitda?: number | null;
  employees?: number | null;
  companyType?: string | null;
  yearsOperating?: number | null;
  revenueGrowthPercent?: number | null;
  arr?: number | null;
}) {
  const { sector, revenue, ebitda, employees, companyType, yearsOperating, revenueGrowthPercent, arr } = body;
  const s = String(sector).toLowerCase();
  const typeUpper = companyType ? String(companyType).toUpperCase() : null;

  type SectorMultipliers = { ebitdaMin: number; ebitdaMax: number; revenueMin: number; revenueMax: number };
  const sectors: Record<string, SectorMultipliers> = {
    tecnologia: { ebitdaMin: 5, ebitdaMax: 12, revenueMin: 1, revenueMax: 3 },
    tech: { ebitdaMin: 5, ebitdaMax: 12, revenueMin: 1, revenueMax: 3 },
    software: { ebitdaMin: 5, ebitdaMax: 12, revenueMin: 1, revenueMax: 3 },
    salud: { ebitdaMin: 4, ebitdaMax: 8, revenueMin: 0.8, revenueMax: 1.8 },
    industria: { ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
    consumo: { ebitdaMin: 3.5, ebitdaMax: 6, revenueMin: 0.4, revenueMax: 1 },
    retail: { ebitdaMin: 3.5, ebitdaMax: 6, revenueMin: 0.4, revenueMax: 1 },
    hosteleria: { ebitdaMin: 2.5, ebitdaMax: 5, revenueMin: 0.3, revenueMax: 0.8 },
    restauracion: { ebitdaMin: 2.5, ebitdaMax: 5, revenueMin: 0.3, revenueMax: 0.8 },
    servicios: { ebitdaMin: 3.5, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
    energia: { ebitdaMin: 5, ebitdaMax: 10, revenueMin: 0.8, revenueMax: 1.8 },
    logistica: { ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
  };

  let mult = sectors["servicios"]!;
  for (const [key, m] of Object.entries(sectors)) {
    if (s.includes(key)) {
      mult = m;
      break;
    }
  }

  const useEbitda = ebitda != null && ebitda > 0 && typeUpper !== "STARTUP";
  const base = useEbitda ? ebitda : arr != null && arr > 0 ? arr : revenue;
  const [multipleMin, multipleMax] = useEbitda
    ? [mult.ebitdaMin, mult.ebitdaMax]
    : [mult.revenueMin, mult.revenueMax];

  let teamFactor =
    typeof employees === "number" && employees > 15
      ? 1.05
      : typeof employees === "number" && employees > 5
        ? 1.02
        : 1.0;

  if (typeof yearsOperating === "number" && yearsOperating >= 5) teamFactor *= 1.02;
  if (typeof yearsOperating === "number" && yearsOperating >= 10) teamFactor *= 1.02;

  if (typeof revenueGrowthPercent === "number" && revenueGrowthPercent >= 50) teamFactor *= 1.05;
  if (typeof revenueGrowthPercent === "number" && revenueGrowthPercent >= 100) teamFactor *= 1.05;

  const minValue = Math.round(base * multipleMin * teamFactor);
  const maxValue = Math.round(base * multipleMax * teamFactor);
  return {
    minValue: Math.max(0, minValue),
    maxValue: Math.max(minValue, maxValue),
  };
}
