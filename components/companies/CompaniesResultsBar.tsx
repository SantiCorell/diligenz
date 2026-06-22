"use client";

import { Building2, MapPin, X } from "lucide-react";
import { PRIMARY_SECTOR_OPTIONS } from "@/lib/valuation-sectors";

type Props = {
  total: number;
  sectorSlug: string;
  location: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onClearSector?: () => void;
  onClearLocation?: () => void;
};

export default function CompaniesResultsBar({
  total,
  sectorSlug,
  location,
  currentPage,
  totalPages,
  pageSize,
  onClearSector,
  onClearLocation,
}: Props) {
  const sectorMeta = PRIMARY_SECTOR_OPTIONS.find((s) => s.value === sectorSlug);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  const headline = sectorMeta
    ? `Se han encontrado ${total} ${total === 1 ? "empresa" : "empresas"} en ${sectorMeta.shortLabel}`
    : `Se han encontrado ${total} ${total === 1 ? "empresa" : "empresas"}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-black/[0.06] bg-[var(--surface-card)] px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
          <Building2 className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-semibold text-[var(--foreground)]">{headline}</p>
          <p className="mt-0.5 text-xs sm:text-sm text-[var(--foreground)]/55">
            {total > 0 ? (
              <>
                Mostrando {from}–{to} de {total}
                {totalPages > 1 && (
                  <span>
                    {" "}
                    · Página {currentPage} de {totalPages}
                  </span>
                )}
              </>
            ) : (
              "Prueba otro sector o cambia la ubicación para ampliar resultados."
            )}
          </p>
        </div>
      </div>

      {(sectorSlug || location) && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {sectorMeta && (
            <button
              type="button"
              onClick={onClearSector}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/[0.06] px-3 py-1 text-xs font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition"
            >
              {sectorMeta.shortLabel}
              <X className="h-3 w-3" />
            </button>
          )}
          {location && (
            <button
              type="button"
              onClick={onClearLocation}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[var(--surface-muted)]/60 px-3 py-1 text-xs font-medium text-[var(--foreground)]/70 hover:bg-[var(--surface-muted)] transition"
            >
              <MapPin className="h-3 w-3 opacity-60" />
              {location}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
