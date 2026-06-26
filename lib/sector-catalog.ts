import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  LEGACY_SECTOR_OPTIONS,
  VALUATION_SECTOR_OPTIONS,
  type SectorOption,
} from "@/lib/valuation-sectors";

export type CustomSectorRow = {
  slug: string;
  label: string;
  shortLabel: string | null;
  iconKey: string;
  colorKey: string;
};

export const getActiveCustomSectors = cache(async (): Promise<CustomSectorRow[]> => {
  try {
    return await prisma.sectorCatalog.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { slug: true, label: true, shortLabel: true, iconKey: true, colorKey: true },
    });
  } catch {
    return [];
  }
});

export async function getFormSectorOptions(): Promise<SectorOption[]> {
  const custom = await getActiveCustomSectors();
  const builtIn = VALUATION_SECTOR_OPTIONS.filter((o) => o.value !== "");
  const customOptions: SectorOption[] = custom.map((c) => ({
    value: c.slug,
    label: c.label,
    shortLabel: c.shortLabel ?? undefined,
    iconKey: c.iconKey,
    custom: true,
  }));
  return [{ value: "", label: "Selecciona un sector" }, ...builtIn, ...customOptions];
}

export function customSectorsToVisualMap(
  rows: CustomSectorRow[]
): Record<string, { label: string; shortLabel: string; iconKey: string; colorKey: string }> {
  const map: Record<string, { label: string; shortLabel: string; iconKey: string; colorKey: string }> = {};
  for (const row of rows) {
    map[row.slug] = {
      label: row.label,
      shortLabel: row.shortLabel?.trim() || row.label,
      iconKey: row.iconKey,
      colorKey: row.colorKey,
    };
  }
  return map;
}
export function allSectorLabels(value: string, custom: CustomSectorRow[] = []): string {
  const extra: SectorOption[] = custom.map((c) => ({ value: c.slug, label: c.label }));
  const all = [...VALUATION_SECTOR_OPTIONS, ...LEGACY_SECTOR_OPTIONS, ...extra];
  return all.find((o) => o.value === value)?.label ?? value;
}
