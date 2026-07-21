"use client";

import { LayoutGrid } from "lucide-react";
import SectorIcon from "@/components/companies/SectorIcon";
import { PRIMARY_SECTOR_OPTIONS } from "@/lib/valuation-sectors";
import { getSectorVisual } from "@/lib/sector-visual";

type Props = {
  selectedSector: string;
  onSectorChange: (slug: string) => void;
  countsBySector: Record<string, number>;
  totalCount: number;
};

export default function PrimarySectorFilter({
  selectedSector,
  onSectorChange,
  countsBySector,
  totalCount,
}: Props) {
  const allActive = !selectedSector;

  return (
    <section className="mb-8 md:mb-10" aria-label="Filtrar por sector principal">
      <div className="relative mb-6 text-center sm:mb-7">
        <h2 className="text-xl font-bold tracking-tight text-[var(--brand-dark)] sm:text-2xl md:text-[1.75rem]">
          ¿Qué tipo de empresa buscas?
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)]/65 sm:text-base">
          Selecciona un sector. Los resultados se actualizan al instante.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--foreground)]/70 sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:text-base">
          <span className="text-[var(--brand-primary)]">{totalCount}</span>{" "}
          {totalCount === 1 ? "empresa" : "empresas"} en catálogo
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => onSectorChange("")}
          aria-pressed={allActive}
          className={`group relative flex flex-col items-start rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 ${
            allActive
              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.05] shadow-[0_0_0_1px_rgba(137,74,246,0.12)]"
              : "border-black/[0.08] bg-white hover:border-[var(--brand-primary)]/25 hover:bg-[var(--brand-primary)]/[0.03]"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              allActive
                ? "border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                : "border-black/[0.06] bg-[var(--surface-muted)]/50 text-[var(--foreground)]/50 group-hover:text-[var(--brand-primary)]"
            }`}
          >
            <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className="mt-3 text-sm font-semibold text-[var(--foreground)]">Todos</span>
          <span className="mt-0.5 text-[11px] text-[var(--foreground)]/50 leading-snug">
            Ver todo el catálogo
          </span>
          <span
            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              allActive
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--foreground)]/55"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {PRIMARY_SECTOR_OPTIONS.map((sector) => {
          const visual = getSectorVisual(sector.value);
          const isActive = selectedSector === sector.value;
          const count = countsBySector[sector.value] ?? 0;

          return (
            <button
              key={sector.value}
              type="button"
              onClick={() => onSectorChange(sector.value)}
              aria-pressed={isActive}
              className={`group relative flex flex-col items-start rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 ${
                isActive
                  ? "bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]"
                  : "border-black/[0.08] bg-white hover:border-black/[0.12] hover:bg-[var(--surface-muted)]/20"
              }`}
              style={
                isActive
                  ? {
                      borderColor: visual.accent,
                      backgroundColor: `${visual.accent}08`,
                      boxShadow: `0 0 0 1px ${visual.accent}20, 0 4px 20px rgba(15,23,42,0.05)`,
                    }
                  : undefined
              }
            >
              <SectorIcon sector={sector.value} size="xs" className="transition group-hover:scale-[1.03]" />
              <span className="mt-3 text-sm font-semibold text-[var(--foreground)] leading-tight">
                {sector.shortLabel}
              </span>
              <span className="mt-0.5 text-[11px] text-[var(--foreground)]/50 leading-snug line-clamp-2">
                {sector.description}
              </span>
              <span
                className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{
                  backgroundColor: isActive ? visual.accent : `${visual.accent}cc`,
                }}
              >
                {count} {count === 1 ? "empresa" : "empresas"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
