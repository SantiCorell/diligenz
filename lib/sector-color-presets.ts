export type SectorColorPreset = {
  key: string;
  label: string;
  accent: string;
  iconBgClass: string;
  tagClass: string;
};

/** Paleta de colores para sectores personalizados (admin elige icono + color). */
export const SECTOR_COLOR_PRESETS: SectorColorPreset[] = [
  {
    key: "green",
    label: "Verde",
    accent: "#16a34a",
    iconBgClass: "bg-green-100 text-green-600",
    tagClass: "bg-green-50 text-green-700",
  },
  {
    key: "emerald",
    label: "Verde esmeralda",
    accent: "#059669",
    iconBgClass: "bg-emerald-100 text-emerald-600",
    tagClass: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "rose",
    label: "Rosa / salud",
    accent: "#e11d48",
    iconBgClass: "bg-rose-100 text-rose-600",
    tagClass: "bg-rose-50 text-rose-700",
  },
  {
    key: "violet",
    label: "Violeta",
    accent: "#7c3aed",
    iconBgClass: "bg-violet-100 text-violet-600",
    tagClass: "bg-violet-50 text-violet-700",
  },
  {
    key: "purple",
    label: "Púrpura",
    accent: "#9333ea",
    iconBgClass: "bg-purple-100 text-purple-600",
    tagClass: "bg-purple-50 text-purple-700",
  },
  {
    key: "blue",
    label: "Azul",
    accent: "#2563eb",
    iconBgClass: "bg-blue-100 text-blue-600",
    tagClass: "bg-blue-50 text-blue-700",
  },
  {
    key: "sky",
    label: "Celeste",
    accent: "#0284c7",
    iconBgClass: "bg-sky-100 text-sky-600",
    tagClass: "bg-sky-50 text-sky-700",
  },
  {
    key: "indigo",
    label: "Índigo",
    accent: "#4f46e5",
    iconBgClass: "bg-indigo-100 text-indigo-600",
    tagClass: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "orange",
    label: "Naranja",
    accent: "#ea580c",
    iconBgClass: "bg-orange-100 text-orange-600",
    tagClass: "bg-orange-50 text-orange-700",
  },
  {
    key: "amber",
    label: "Ámbar",
    accent: "#d97706",
    iconBgClass: "bg-amber-100 text-amber-600",
    tagClass: "bg-amber-50 text-amber-700",
  },
  {
    key: "yellow",
    label: "Amarillo",
    accent: "#ca8a04",
    iconBgClass: "bg-yellow-100 text-yellow-700",
    tagClass: "bg-yellow-50 text-yellow-800",
  },
  {
    key: "lime",
    label: "Lima",
    accent: "#65a30d",
    iconBgClass: "bg-lime-100 text-lime-700",
    tagClass: "bg-lime-50 text-lime-800",
  },
  {
    key: "slate",
    label: "Gris pizarra",
    accent: "#475569",
    iconBgClass: "bg-slate-100 text-slate-600",
    tagClass: "bg-slate-50 text-slate-700",
  },
  {
    key: "stone",
    label: "Gris piedra",
    accent: "#78716c",
    iconBgClass: "bg-stone-100 text-stone-600",
    tagClass: "bg-stone-50 text-stone-700",
  },
  {
    key: "zinc",
    label: "Zinc",
    accent: "#71717a",
    iconBgClass: "bg-zinc-100 text-zinc-600",
    tagClass: "bg-zinc-50 text-zinc-700",
  },
];

export function getSectorColorPreset(key: string): SectorColorPreset | undefined {
  return SECTOR_COLOR_PRESETS.find((p) => p.key === key);
}

export const DEFAULT_SECTOR_COLOR_KEY = "violet";
