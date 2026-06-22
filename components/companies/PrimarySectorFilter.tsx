"use client";

import { LayoutGrid } from "lucide-react";
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
    <section
      className="rounded-2xl border border-black/[0.06] bg-[var(--surface-card)] p-4 sm:p-5 md:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.05)]"
      aria-label="Filtrar por sector principal"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
            Explora por sector
          </p>
          <h2 className="mt-1 text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            ¿Qué tipo de empresa buscas?
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60 max-w-xl">
            Selecciona uno de los cinco sectores principales del marketplace. Los resultados se actualizan al instante.
          </p>
        </div>
        <p className="mt-2 sm:mt-0 text-sm font-medium text-[var(--foreground)]/70 shrink-0">
          <span className="text-[var(--brand-primary)] font-semibold">{totalCount}</span>{" "}
          {totalCount === 1 ? "empresa" : "empresas"} en catálogo
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => onSectorChange("")}
          aria-pressed={allActive}
          className={`group relative flex flex-col items-start rounded-xl border-2 p-3.5 sm:p-4 text-left transition-all duration-200 ${
            allActive
              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.06] shadow-[0_0_0_1px_rgba(137,74,246,0.15)]"
              : "border-black/[0.06] bg-[var(--surface-muted)]/40 hover:border-[var(--brand-primary)]/30 hover:bg-[var(--surface-muted)]/70"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
              allActive
                ? "border-[var(--brand-primary)]/25 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                : "border-black/[0.06] bg-[var(--surface-card)] text-[var(--foreground)]/50 group-hover:text-[var(--brand-primary)]"
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
                : "bg-[var(--surface-card)] text-[var(--foreground)]/55 border border-black/[0.06]"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {PRIMARY_SECTOR_OPTIONS.map((sector) => {
          const visual = getSectorVisual(sector.value);
          const Icon = visual.icon;
          const isActive = selectedSector === sector.value;
          const count = countsBySector[sector.value] ?? 0;

          return (
            <button
              key={sector.value}
              type="button"
              onClick={() => onSectorChange(sector.value)}
              aria-pressed={isActive}
              className={`group relative flex flex-col items-start rounded-xl border-2 p-3.5 sm:p-4 text-left transition-all duration-200 ${
                isActive
                  ? "shadow-[0_4px_16px_rgba(15,23,42,0.08)]"
                  : "border-black/[0.06] bg-[var(--surface-muted)]/30 hover:border-black/[0.1] hover:bg-[var(--surface-muted)]/60"
              }`}
              style={
                isActive
                  ? {
                      borderColor: visual.accent,
                      backgroundColor: `${visual.accent}10`,
                      boxShadow: `0 0 0 1px ${visual.accent}22, 0 4px 16px rgba(15,23,42,0.06)`,
                    }
                  : undefined
              }
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.06] bg-[var(--surface-card)] transition group-hover:scale-[1.03]"
                style={{ color: visual.iconColor }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
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
