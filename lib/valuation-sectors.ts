/**
 * Sectores del formulario «Valorar empresa» (/sell) y etiquetas para filtros / SEO.
 * Los `value` se guardan en Company.sector y ValuationLead.sector.
 */

export type SectorOption = { value: string; label: string };

/** Opciones del desplegable en /sell (orden de la UI). */
export const VALUATION_SECTOR_OPTIONS: SectorOption[] = [
  { value: "", label: "Selecciona un sector" },
  { value: "tecnologia-software-saas", label: "Tecnología / Software / SaaS" },
  { value: "hosteleria-restauracion", label: "Hostelería / Restauración" },
  { value: "retail-comercio", label: "Retail / Comercio" },
  { value: "industria-manufactura", label: "Industria / Manufactura" },
  { value: "servicios-profesionales-b2b", label: "Servicios profesionales / B2B" },
  { value: "salud-bienestar", label: "Salud / Bienestar" },
  { value: "educacion-formacion", label: "Educación / Formación" },
  { value: "logistica-transporte", label: "Logística / Transporte" },
  { value: "inmobiliario-proptech", label: "Inmobiliario / Proptech" },
  { value: "medios-contenidos-ecommerce", label: "Medios / Contenidos / E-commerce" },
  { value: "agrifood-agronegocio", label: "Agroalimentario / Agronegocio" },
  { value: "energia-sostenibilidad", label: "Energía / Sostenibilidad" },
  { value: "turismo-ocio", label: "Turismo / Ocio" },
  { value: "construccion-infraestructuras", label: "Construcción / Infraestructuras" },
  { value: "otro-abierto", label: "Otro / Abierto a varios sectores" },
];

/** Valores legacy (datos antiguos + filtros catálogo). */
const LEGACY_SECTOR_OPTIONS: SectorOption[] = [
  { value: "tecnologia", label: "Tecnología (histórico)" },
  { value: "salud", label: "Salud (histórico)" },
  { value: "industria", label: "Industria (histórico)" },
  { value: "consumo", label: "Consumo (histórico)" },
  { value: "hosteleria", label: "Hostelería (histórico)" },
  { value: "servicios", label: "Servicios (histórico)" },
  { value: "energia", label: "Energía (histórico)" },
  { value: "logistica", label: "Logística (histórico)" },
];

/** Filtro catálogo: nuevos + legacy sin duplicar el vacío. */
export const CATALOG_SECTOR_OPTIONS: SectorOption[] = [
  { value: "", label: "Todos los sectores" },
  ...VALUATION_SECTOR_OPTIONS.filter((o) => o.value !== ""),
  ...LEGACY_SECTOR_OPTIONS,
];

export function sectorLabel(value: string): string {
  const all = [...VALUATION_SECTOR_OPTIONS, ...LEGACY_SECTOR_OPTIONS];
  return all.find((o) => o.value === value)?.label ?? value;
}

/** Mapa slug → etiqueta corta para metadata (solo claves usadas en URL). */
export function catalogSectorLabelsRecord(): Record<string, string> {
  const m: Record<string, string> = {};
  for (const o of CATALOG_SECTOR_OPTIONS) {
    if (o.value) m[o.value] = o.label.replace(" (histórico)", "");
  }
  return m;
}
