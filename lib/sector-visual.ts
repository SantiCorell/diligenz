import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cpu,
  Factory,
  GraduationCap,
  HardHat,
  HeartPulse,
  Layers,
  Leaf,
  MonitorSmartphone,
  Plane,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import {
  LEGACY_SECTOR_OPTIONS,
  PRIMARY_SECTOR_OPTIONS,
  VALUATION_SECTOR_OPTIONS,
  sectorLabel,
} from "@/lib/valuation-sectors";

export type SectorVisualStyle = {
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  accent: string;
  iconBgClass: string;
  tagClass: string;
  /** @deprecated Usar iconBgClass — mantenido para estilos inline legacy */
  iconBg: string;
  /** @deprecated Usar iconBgClass — mantenido para estilos inline legacy */
  iconColor: string;
  surface: string;
};

export type HomepageFeaturedSector = {
  slug: string;
  name: string;
  description: string;
};

type SectorStyleBase = {
  icon: LucideIcon;
  accent: string;
  iconBgClass: string;
  tagClass: string;
};

type SectorKey =
  | "tecnologia-software-saas"
  | "hosteleria-restauracion"
  | "retail-comercio"
  | "industria-manufactura"
  | "servicios-profesionales-b2b"
  | "salud-bienestar"
  | "educacion-formacion"
  | "logistica-transporte"
  | "inmobiliario-proptech"
  | "medios-contenidos-ecommerce"
  | "agrifood-agronegocio"
  | "energia-sostenibilidad"
  | "turismo-ocio"
  | "construccion-infraestructuras"
  | "otro-abierto";

const SHORT_LABELS: Record<SectorKey, string> = {
  "tecnologia-software-saas": "Tecnología",
  "hosteleria-restauracion": "Hostelería",
  "retail-comercio": "Consumo",
  "industria-manufactura": "Industria",
  "servicios-profesionales-b2b": "Servicios B2B",
  "salud-bienestar": "Salud",
  "educacion-formacion": "Educación",
  "logistica-transporte": "Logística",
  "inmobiliario-proptech": "Inmobiliario",
  "medios-contenidos-ecommerce": "E-commerce",
  "agrifood-agronegocio": "Agroalimentario",
  "energia-sostenibilidad": "Energía",
  "turismo-ocio": "Turismo",
  "construccion-infraestructuras": "Construcción",
  "otro-abierto": "Otros",
};

const SURFACE = "#ffffff";

const SECTOR_STYLES: Record<SectorKey, SectorStyleBase> = {
  "tecnologia-software-saas": {
    icon: Cpu,
    accent: "#7c3aed",
    iconBgClass: "bg-violet-100 text-violet-600",
    tagClass: "bg-violet-50 text-violet-700",
  },
  "hosteleria-restauracion": {
    icon: UtensilsCrossed,
    accent: "#ea580c",
    iconBgClass: "bg-orange-100 text-orange-600",
    tagClass: "bg-orange-50 text-orange-700",
  },
  "retail-comercio": {
    icon: ShoppingBag,
    accent: "#d97706",
    iconBgClass: "bg-amber-100 text-amber-600",
    tagClass: "bg-amber-50 text-amber-700",
  },
  "industria-manufactura": {
    icon: Factory,
    accent: "#475569",
    iconBgClass: "bg-slate-100 text-slate-600",
    tagClass: "bg-slate-50 text-slate-700",
  },
  "servicios-profesionales-b2b": {
    icon: Building2,
    accent: "#2563eb",
    iconBgClass: "bg-blue-100 text-blue-600",
    tagClass: "bg-blue-50 text-blue-700",
  },
  "salud-bienestar": {
    icon: HeartPulse,
    accent: "#e11d48",
    iconBgClass: "bg-rose-100 text-rose-600",
    tagClass: "bg-rose-50 text-rose-700",
  },
  "educacion-formacion": {
    icon: GraduationCap,
    accent: "#4f46e5",
    iconBgClass: "bg-indigo-100 text-indigo-600",
    tagClass: "bg-indigo-50 text-indigo-700",
  },
  "logistica-transporte": {
    icon: Truck,
    accent: "#78716c",
    iconBgClass: "bg-stone-100 text-stone-600",
    tagClass: "bg-stone-50 text-stone-700",
  },
  "inmobiliario-proptech": {
    icon: Building2,
    accent: "#71717a",
    iconBgClass: "bg-zinc-100 text-zinc-600",
    tagClass: "bg-zinc-50 text-zinc-700",
  },
  "medios-contenidos-ecommerce": {
    icon: MonitorSmartphone,
    accent: "#9333ea",
    iconBgClass: "bg-purple-100 text-purple-600",
    tagClass: "bg-purple-50 text-purple-700",
  },
  "agrifood-agronegocio": {
    icon: Wheat,
    accent: "#65a30d",
    iconBgClass: "bg-lime-100 text-lime-700",
    tagClass: "bg-lime-50 text-lime-800",
  },
  "energia-sostenibilidad": {
    icon: Leaf,
    accent: "#059669",
    iconBgClass: "bg-emerald-100 text-emerald-600",
    tagClass: "bg-emerald-50 text-emerald-700",
  },
  "turismo-ocio": {
    icon: Plane,
    accent: "#0284c7",
    iconBgClass: "bg-sky-100 text-sky-600",
    tagClass: "bg-sky-50 text-sky-700",
  },
  "construccion-infraestructuras": {
    icon: HardHat,
    accent: "#ca8a04",
    iconBgClass: "bg-yellow-100 text-yellow-700",
    tagClass: "bg-yellow-50 text-yellow-800",
  },
  "otro-abierto": {
    icon: Layers,
    accent: "#7c3aed",
    iconBgClass: "bg-violet-100 text-violet-600",
    tagClass: "bg-violet-50 text-violet-700",
  },
};

/** Cuatro sectores destacados en home — misma línea visual que CompanyCard */
export const HOMEPAGE_FEATURED_SECTORS: HomepageFeaturedSector[] = [
  {
    slug: "salud",
    name: "Salud",
    description: "Clínicas, laboratorios y servicios sanitarios privados.",
  },
  {
    slug: "tecnologia",
    name: "Tecnología",
    description: "SaaS, software B2B y negocios digitales escalables.",
  },
  {
    slug: "industria",
    name: "Industria",
    description: "Fabricación, logística e ingeniería especializada.",
  },
  {
    slug: "consumo",
    name: "Consumo",
    description: "Retail, marcas y e-commerce consolidados.",
  },
];

const SLUG_ALIASES: Record<string, SectorKey> = {
  tecnologia: "tecnologia-software-saas",
  salud: "salud-bienestar",
  industria: "industria-manufactura",
  consumo: "retail-comercio",
  hosteleria: "hosteleria-restauracion",
  servicios: "servicios-profesionales-b2b",
  energia: "energia-sostenibilidad",
  logistica: "logistica-transporte",
  construccion: "construccion-infraestructuras",
  alimentacion: "agrifood-agronegocio",
  otros: "otro-abierto",
};

const KEYWORD_RULES: { keywords: string[]; key: SectorKey }[] = [
  { keywords: ["tecnolog", "software", "saas", "digital", "tech"], key: "tecnologia-software-saas" },
  { keywords: ["hosteler", "restaur", "bar", "catering"], key: "hosteleria-restauracion" },
  { keywords: ["retail", "comercio", "consumo", "tienda"], key: "retail-comercio" },
  { keywords: ["industr", "manufact", "fabric"], key: "industria-manufactura" },
  { keywords: ["servicio", "b2b", "profesional", "consult"], key: "servicios-profesionales-b2b" },
  { keywords: ["salud", "bienestar", "clinic", "sanit"], key: "salud-bienestar" },
  { keywords: ["educac", "formacion", "academ"], key: "educacion-formacion" },
  { keywords: ["logist", "transport", "distribuc"], key: "logistica-transporte" },
  { keywords: ["inmobil", "proptech", "real estate"], key: "inmobiliario-proptech" },
  { keywords: ["ecommerce", "e-commerce", "medios", "contenido"], key: "medios-contenidos-ecommerce" },
  { keywords: ["agro", "aliment", "food"], key: "agrifood-agronegocio" },
  { keywords: ["energ", "sostenib", "renovab"], key: "energia-sostenibilidad" },
  { keywords: ["turismo", "ocio", "hotel", "viaje"], key: "turismo-ocio" },
  { keywords: ["construc", "infraestruct"], key: "construccion-infraestructuras" },
];

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function resolveSectorKey(rawSector: string): SectorKey {
  const normalized = normalizeKey(rawSector);
  if (!normalized) return "otro-abierto";

  if (normalized in SECTOR_STYLES) return normalized as SectorKey;
  if (normalized in SLUG_ALIASES) return SLUG_ALIASES[normalized]!;

  for (const { keywords, key } of KEYWORD_RULES) {
    if (keywords.some((kw) => normalized.includes(kw))) return key;
  }

  return "otro-abierto";
}

export function matchesPrimarySector(rawSector: string, primarySlug: string): boolean {
  if (!primarySlug) return true;
  return resolveSectorKey(rawSector) === resolveSectorKey(primarySlug);
}

/** Valores posibles en BD que corresponden a un sector principal (slug). */
export function sectorDbValuesForFilter(primarySlug: string): string[] {
  const targetKey = resolveSectorKey(primarySlug);
  const values = new Set<string>();

  values.add(targetKey);
  values.add(sectorLabel(targetKey));

  for (const opt of [...VALUATION_SECTOR_OPTIONS, ...LEGACY_SECTOR_OPTIONS, ...PRIMARY_SECTOR_OPTIONS]) {
    if (!opt.value) continue;
    if (resolveSectorKey(opt.value) === targetKey) {
      values.add(opt.value);
      values.add(opt.label.replace(" (histórico)", ""));
    }
  }

  for (const [alias, key] of Object.entries(SLUG_ALIASES)) {
    if (key === targetKey) {
      values.add(alias);
      values.add(sectorLabel(alias));
    }
  }

  return Array.from(values).filter(Boolean);
}

export function getSectorVisual(sector: string): SectorVisualStyle {
  const key = resolveSectorKey(sector);
  const style = SECTOR_STYLES[key];
  const label = sectorLabel(sector);
  const displayLabel =
    label && label !== sector
      ? label.replace(" (histórico)", "")
      : sector.trim() || "Sector no indicado";

  return {
    ...style,
    label: displayLabel,
    shortLabel: SHORT_LABELS[key],
    iconBg: style.iconBgClass,
    iconColor: style.accent,
    surface: SURFACE,
  };
}
