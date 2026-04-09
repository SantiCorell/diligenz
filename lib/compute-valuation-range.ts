/**
 * Valoración orientativa: múltiplos por sector con bandas estrechas (menos dispersión €).
 * Con EBITDA positivo: múltiplo sobre EBITDA. Sin EBITDA (o startup sin beneficio): sobre facturación / ARR.
 */

type Mults = { ebitdaMin: number; ebitdaMax: number; revenueMin: number; revenueMax: number };

const DEFAULT: Mults = {
  ebitdaMin: 3.8,
  ebitdaMax: 4.9,
  revenueMin: 0.48,
  revenueMax: 0.62,
};

/** Orden: slugs nuevos y legacy; primera coincidencia por igualdad o prefijo. */
const SECTOR_MULTS: { keys: string[]; m: Mults }[] = [
  {
    keys: ["tecnologia-software-saas", "tecnologia", "software", "saas"],
    m: { ebitdaMin: 6.0, ebitdaMax: 7.6, revenueMin: 0.58, revenueMax: 0.74 },
  },
  {
    keys: ["hosteleria-restauracion", "hosteleria", "restauracion"],
    m: { ebitdaMin: 2.7, ebitdaMax: 3.5, revenueMin: 0.32, revenueMax: 0.44 },
  },
  {
    keys: ["retail-comercio", "consumo", "retail"],
    m: { ebitdaMin: 3.1, ebitdaMax: 4.0, revenueMin: 0.4, revenueMax: 0.52 },
  },
  {
    keys: ["industria-manufactura", "industria", "manufactura"],
    m: { ebitdaMin: 3.6, ebitdaMax: 4.7, revenueMin: 0.46, revenueMax: 0.6 },
  },
  {
    keys: ["servicios-profesionales-b2b", "servicios"],
    m: { ebitdaMin: 3.9, ebitdaMax: 5.0, revenueMin: 0.5, revenueMax: 0.64 },
  },
  {
    keys: ["salud-bienestar", "salud"],
    m: { ebitdaMin: 4.2, ebitdaMax: 5.4, revenueMin: 0.54, revenueMax: 0.7 },
  },
  {
    keys: ["educacion-formacion", "educacion", "formacion"],
    m: { ebitdaMin: 3.4, ebitdaMax: 4.4, revenueMin: 0.44, revenueMax: 0.56 },
  },
  {
    keys: ["logistica-transporte", "logistica", "transporte"],
    m: { ebitdaMin: 3.5, ebitdaMax: 4.5, revenueMin: 0.46, revenueMax: 0.58 },
  },
  {
    keys: ["inmobiliario-proptech", "inmobiliario", "proptech"],
    m: { ebitdaMin: 3.8, ebitdaMax: 4.9, revenueMin: 0.44, revenueMax: 0.58 },
  },
  {
    keys: ["medios-contenidos-ecommerce", "medios", "ecommerce", "contenidos"],
    m: { ebitdaMin: 3.6, ebitdaMax: 4.7, revenueMin: 0.46, revenueMax: 0.6 },
  },
  {
    keys: ["agrifood-agronegocio", "agro", "agrifood"],
    m: { ebitdaMin: 3.4, ebitdaMax: 4.4, revenueMin: 0.44, revenueMax: 0.56 },
  },
  {
    keys: ["energia-sostenibilidad", "energia", "sostenibilidad"],
    m: { ebitdaMin: 4.0, ebitdaMax: 5.2, revenueMin: 0.52, revenueMax: 0.66 },
  },
  {
    keys: ["turismo-ocio", "turismo", "ocio"],
    m: { ebitdaMin: 3.0, ebitdaMax: 3.9, revenueMin: 0.38, revenueMax: 0.5 },
  },
  {
    keys: ["construccion-infraestructuras", "construccion", "infraestructuras"],
    m: { ebitdaMin: 3.5, ebitdaMax: 4.5, revenueMin: 0.45, revenueMax: 0.58 },
  },
  { keys: ["otro-abierto", "otro"], m: DEFAULT },
];

function resolveMults(sector: string): Mults {
  const s = String(sector).toLowerCase().trim();
  if (!s) return DEFAULT;

  for (const row of SECTOR_MULTS) {
    for (const key of row.keys) {
      if (s === key || s.startsWith(key + "-")) {
        return row.m;
      }
    }
  }

  for (const row of SECTOR_MULTS) {
    for (const key of row.keys) {
      if (s.includes(key)) return row.m;
    }
  }

  return DEFAULT;
}

function smallTeamFactor(
  employees?: number | null,
  yearsOperating?: number | null,
  revenueGrowthPercent?: number | null
): number {
  let f = 1.0;
  if (typeof employees === "number" && employees > 15) f *= 1.025;
  else if (typeof employees === "number" && employees > 5) f *= 1.012;
  if (typeof yearsOperating === "number" && yearsOperating >= 10) f *= 1.018;
  else if (typeof yearsOperating === "number" && yearsOperating >= 5) f *= 1.01;
  if (typeof revenueGrowthPercent === "number" && revenueGrowthPercent >= 100) f *= 1.022;
  else if (typeof revenueGrowthPercent === "number" && revenueGrowthPercent >= 50) f *= 1.012;
  return Math.min(f, 1.06);
}

/**
 * Comprime el rango en € hacia el centro (menos “de 4 a 10 M€”).
 * Más compresión si hay EBITDA declarado (base más fiable).
 */
function tightenEuroBand(
  minV: number,
  maxV: number,
  opts: {
    useEbitda: boolean;
    employees?: number | null;
    yearsOperating?: number | null;
  }
): { minValue: number; maxValue: number } {
  const mid = (minV + maxV) / 2;
  let half = (maxV - minV) / 2;
  if (opts.useEbitda) half *= 0.72;
  else half *= 0.82;
  if (opts.employees != null && opts.employees > 0) half *= 0.94;
  if (opts.yearsOperating != null && opts.yearsOperating >= 3) half *= 0.96;
  let minR = Math.round(mid - half);
  let maxR = Math.round(mid + half);
  const minSpread = Math.max(50_000, Math.round(mid * 0.04));
  if (maxR - minR < minSpread) {
    maxR = minR + minSpread;
  }
  if (maxR <= minR) maxR = minR + minSpread;
  return { minValue: Math.max(0, minR), maxValue: maxR };
}

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
  const { sector, revenue, ebitda, employees, companyType, yearsOperating, revenueGrowthPercent, arr } =
    body;
  const typeUpper = companyType ? String(companyType).toUpperCase() : null;

  const mult = resolveMults(sector);
  // Solo «startup» histórico prioriza ingresos/ARR sobre EBITDA; empresa y autónomo usan EBITDA si es positivo.
  const useEbitda = ebitda != null && ebitda > 0 && typeUpper !== "STARTUP";
  const base = useEbitda ? ebitda : arr != null && arr > 0 ? arr : revenue;
  const [multipleMin, multipleMax] = useEbitda
    ? [mult.ebitdaMin, mult.ebitdaMax]
    : [mult.revenueMin, mult.revenueMax];

  const tf = smallTeamFactor(employees, yearsOperating, revenueGrowthPercent);
  const rawMin = Math.round(base * multipleMin * tf);
  const rawMax = Math.round(base * multipleMax * tf);

  return tightenEuroBand(Math.max(0, rawMin), Math.max(rawMin, rawMax), {
    useEbitda,
    employees,
    yearsOperating,
  });
}
