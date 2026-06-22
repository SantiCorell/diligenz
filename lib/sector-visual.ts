import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Code2,
  Factory,
  GraduationCap,
  HardHat,
  HeartPulse,
  Layers,
  Leaf,
  Plane,
  ShoppingBag,
  Store,
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
  accent: string;
  iconBg: string;
  iconColor: string;
  surface: string;
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

const ICON_BG = "#F0EFEB";
const SURFACE = "#ffffff";

const SECTOR_STYLES: Record<SectorKey, Omit<SectorVisualStyle, "label">> = {
  "tecnologia-software-saas": {
    icon: Code2,
    accent: "#6B6FA8",
    iconBg: ICON_BG,
    iconColor: "#6B6FA8",
    surface: SURFACE,
  },
  "hosteleria-restauracion": {
    icon: UtensilsCrossed,
    accent: "#9A7B5C",
    iconBg: ICON_BG,
    iconColor: "#9A7B5C",
    surface: SURFACE,
  },
  "retail-comercio": {
    icon: Store,
    accent: "#8A6B7A",
    iconBg: ICON_BG,
    iconColor: "#8A6B7A",
    surface: SURFACE,
  },
  "industria-manufactura": {
    icon: Factory,
    accent: "#6B7280",
    iconBg: ICON_BG,
    iconColor: "#6B7280",
    surface: SURFACE,
  },
  "servicios-profesionales-b2b": {
    icon: Building2,
    accent: "#5C6B8A",
    iconBg: ICON_BG,
    iconColor: "#5C6B8A",
    surface: SURFACE,
  },
  "salud-bienestar": {
    icon: HeartPulse,
    accent: "#5C8A82",
    iconBg: ICON_BG,
    iconColor: "#5C8A82",
    surface: SURFACE,
  },
  "educacion-formacion": {
    icon: GraduationCap,
    accent: "#5C6FA8",
    iconBg: ICON_BG,
    iconColor: "#5C6FA8",
    surface: SURFACE,
  },
  "logistica-transporte": {
    icon: Truck,
    accent: "#8A6B55",
    iconBg: ICON_BG,
    iconColor: "#8A6B55",
    surface: SURFACE,
  },
  "inmobiliario-proptech": {
    icon: Building2,
    accent: "#78716C",
    iconBg: ICON_BG,
    iconColor: "#78716C",
    surface: SURFACE,
  },
  "medios-contenidos-ecommerce": {
    icon: ShoppingBag,
    accent: "#7A6B9A",
    iconBg: ICON_BG,
    iconColor: "#7A6B9A",
    surface: SURFACE,
  },
  "agrifood-agronegocio": {
    icon: Wheat,
    accent: "#6B8255",
    iconBg: ICON_BG,
    iconColor: "#6B8255",
    surface: SURFACE,
  },
  "energia-sostenibilidad": {
    icon: Leaf,
    accent: "#5C8A65",
    iconBg: ICON_BG,
    iconColor: "#5C8A65",
    surface: SURFACE,
  },
  "turismo-ocio": {
    icon: Plane,
    accent: "#5C7A9A",
    iconBg: ICON_BG,
    iconColor: "#5C7A9A",
    surface: SURFACE,
  },
  "construccion-infraestructuras": {
    icon: HardHat,
    accent: "#8A7A55",
    iconBg: ICON_BG,
    iconColor: "#8A7A55",
    surface: SURFACE,
  },
  "otro-abierto": {
    icon: Layers,
    accent: "#7A6B9A",
    iconBg: ICON_BG,
    iconColor: "#7A6B9A",
    surface: SURFACE,
  },
};

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

  return { ...style, label: displayLabel };
}
