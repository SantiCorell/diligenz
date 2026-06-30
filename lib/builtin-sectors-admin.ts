import {
  LEGACY_SECTOR_OPTIONS,
  VALUATION_SECTOR_OPTIONS,
} from "@/lib/valuation-sectors";

export type BuiltinSectorAdminRow = {
  slug: string;
  label: string;
  shortLabel: string;
  iconKey: string;
  colorKey: string;
  kind: "builtin" | "legacy";
};

/** Metadatos por defecto de sectores integrados (icono + color editables al personalizar). */
const BUILTIN_DEFAULTS: Record<string, { shortLabel: string; iconKey: string; colorKey: string }> = {
  "tecnologia-software-saas": { shortLabel: "Tecnología", iconKey: "Cpu", colorKey: "violet" },
  "hosteleria-restauracion": { shortLabel: "Hostelería", iconKey: "UtensilsCrossed", colorKey: "orange" },
  "retail-comercio": { shortLabel: "Consumo", iconKey: "ShoppingBag", colorKey: "amber" },
  "industria-manufactura": { shortLabel: "Industria", iconKey: "Factory", colorKey: "slate" },
  "servicios-profesionales-b2b": { shortLabel: "Servicios B2B", iconKey: "Building2", colorKey: "blue" },
  "salud-bienestar": { shortLabel: "Salud", iconKey: "HeartPulse", colorKey: "rose" },
  farma: { shortLabel: "Farma", iconKey: "PharmacyCross", colorKey: "green" },
  "educacion-formacion": { shortLabel: "Educación", iconKey: "GraduationCap", colorKey: "indigo" },
  "logistica-transporte": { shortLabel: "Logística", iconKey: "Truck", colorKey: "stone" },
  "inmobiliario-proptech": { shortLabel: "Inmobiliario", iconKey: "Building2", colorKey: "zinc" },
  "medios-contenidos-ecommerce": { shortLabel: "E-commerce", iconKey: "MonitorSmartphone", colorKey: "purple" },
  "agrifood-agronegocio": { shortLabel: "Alimentación", iconKey: "Wheat", colorKey: "lime" },
  "energia-sostenibilidad": { shortLabel: "Energía", iconKey: "Leaf", colorKey: "emerald" },
  "turismo-ocio": { shortLabel: "Turismo", iconKey: "Plane", colorKey: "sky" },
  "construccion-infraestructuras": { shortLabel: "Construcción", iconKey: "HardHat", colorKey: "yellow" },
  "otro-abierto": { shortLabel: "Otros", iconKey: "Layers", colorKey: "violet" },
  tecnologia: { shortLabel: "Tecnología", iconKey: "Cpu", colorKey: "violet" },
  salud: { shortLabel: "Salud", iconKey: "HeartPulse", colorKey: "rose" },
  industria: { shortLabel: "Industria", iconKey: "Factory", colorKey: "slate" },
  consumo: { shortLabel: "Consumo", iconKey: "ShoppingBag", colorKey: "amber" },
  hosteleria: { shortLabel: "Hostelería", iconKey: "UtensilsCrossed", colorKey: "orange" },
  servicios: { shortLabel: "Servicios", iconKey: "Building2", colorKey: "blue" },
  energia: { shortLabel: "Energía", iconKey: "Leaf", colorKey: "emerald" },
  logistica: { shortLabel: "Logística", iconKey: "Truck", colorKey: "stone" },
};

function defaultsForSlug(slug: string, label: string, kind: "builtin" | "legacy"): BuiltinSectorAdminRow {
  const meta = BUILTIN_DEFAULTS[slug] ?? {
    shortLabel: label.split("/")[0]?.trim().slice(0, 24) || label.slice(0, 24),
    iconKey: "Layers",
    colorKey: "violet",
  };
  return {
    slug,
    label: label.replace(" (histórico)", ""),
    shortLabel: meta.shortLabel,
    iconKey: meta.iconKey,
    colorKey: meta.colorKey,
    kind,
  };
}

export function listBuiltinSectorsForAdmin(): BuiltinSectorAdminRow[] {
  const rows: BuiltinSectorAdminRow[] = [];

  for (const opt of VALUATION_SECTOR_OPTIONS) {
    if (!opt.value) continue;
    rows.push(defaultsForSlug(opt.value, opt.label, "builtin"));
  }

  for (const opt of LEGACY_SECTOR_OPTIONS) {
    if (!opt.value) continue;
    rows.push(defaultsForSlug(opt.value, opt.label, "legacy"));
  }

  return rows;
}
