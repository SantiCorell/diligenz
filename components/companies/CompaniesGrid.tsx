"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import CompanyCard from "./CompanyCard";
import CompaniesFilters, { type CompaniesDetailFilters } from "./CompaniesFilters";
import PrimarySectorFilter from "./PrimarySectorFilter";
import CompaniesResultsBar from "./CompaniesResultsBar";
import {
  CLEARED_COMPANIES_DETAIL_FILTERS,
} from "@/lib/companies-filter-defaults";
import { reconcileFinancialRange } from "@/lib/financial-range-options";
import type { CompanyMock } from "@/lib/mock-companies";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const RANGE_KEYS = ["revenueMin", "revenueMax", "ebitdaMin", "ebitdaMax"] as const;
type RangeKey = (typeof RANGE_KEYS)[number];

function pickRange(filters: CompaniesDetailFilters) {
  return {
    revenueMin: filters.revenueMin,
    revenueMax: filters.revenueMax,
    ebitdaMin: filters.ebitdaMin,
    ebitdaMax: filters.ebitdaMax,
  };
}

function rangesEqual(a: CompaniesDetailFilters, b: CompaniesDetailFilters) {
  return RANGE_KEYS.every((key) => a[key] === b[key]);
}

type Props = {
  companies: CompanyMock[];
  isLoggedIn: boolean;
  favoriteCompanyIds?: string[];
  filtersFromUrl: CompaniesDetailFilters;
  sectorOptions: { value: string; label: string }[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sectorCounts: Record<string, number>;
  catalogTotal: number;
};

export type CompaniesQueryState = CompaniesDetailFilters & {
  page: number;
};

function buildQuery(state: CompaniesQueryState): string {
  const p = new URLSearchParams();
  if (state.sector) p.set("sector", state.sector);
  if (state.location) p.set("location", state.location);
  if (state.revenueMin) p.set("revenueMin", state.revenueMin);
  if (state.revenueMax) p.set("revenueMax", state.revenueMax);
  if (state.ebitdaMin) p.set("ebitdaMin", state.ebitdaMin);
  if (state.ebitdaMax) p.set("ebitdaMax", state.ebitdaMax);
  if (state.page > 1) p.set("page", String(state.page));
  const q = p.toString();
  return q ? `?${q}` : "";
}

const EMPTY_FILTERS = CLEARED_COMPANIES_DETAIL_FILTERS;

export default function CompaniesGrid({
  companies,
  isLoggedIn,
  favoriteCompanyIds = [],
  filtersFromUrl,
  sectorOptions,
  total,
  totalPages,
  currentPage,
  pageSize,
  sectorCounts,
  catalogTotal,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<CompaniesDetailFilters>(filtersFromUrl);
  const [rangeDraft, setRangeDraft] = useState(pickRange(filtersFromUrl));
  const rangeCommitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipRangeDebounce = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reflejar filtros de la URL */
    setFilters(filtersFromUrl);
    setRangeDraft(pickRange(filtersFromUrl));
    skipRangeDebounce.current = true;
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [filtersFromUrl]);

  const navigate = useCallback(
    (next: CompaniesDetailFilters, page: number) => {
      router.replace(pathname + buildQuery({ ...next, page }), { scroll: false });
    },
    [pathname, router]
  );

  const commitRangeDraft = useCallback(
    (draft: ReturnType<typeof pickRange>) => {
      const next = { ...filters, ...draft };
      if (rangesEqual(filters, next)) return;
      setFilters(next);
      navigate(next, 1);
    },
    [filters, navigate]
  );

  useEffect(() => {
    if (skipRangeDebounce.current) {
      skipRangeDebounce.current = false;
      return;
    }

    if (rangeCommitTimer.current) clearTimeout(rangeCommitTimer.current);
    rangeCommitTimer.current = setTimeout(() => {
      commitRangeDraft(rangeDraft);
    }, 700);

    return () => {
      if (rangeCommitTimer.current) clearTimeout(rangeCommitTimer.current);
    };
  }, [rangeDraft, commitRangeDraft]);

  const favoriteSet = new Set(favoriteCompanyIds);

  const updateFilter = <K extends keyof CompaniesDetailFilters>(key: K, value: CompaniesDetailFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    navigate(next, 1);
  };

  const updateRangeField = (key: RangeKey, value: string) => {
    const changed = key.endsWith("Min") ? "min" : "max";
    let { revenueMin, revenueMax, ebitdaMin, ebitdaMax } = rangeDraft;

    if (key === "revenueMin" || key === "revenueMax") {
      const pair = reconcileFinancialRange(
        key === "revenueMin" ? value : revenueMin,
        key === "revenueMax" ? value : revenueMax,
        changed
      );
      revenueMin = pair.min;
      revenueMax = pair.max;
    } else {
      const pair = reconcileFinancialRange(
        key === "ebitdaMin" ? value : ebitdaMin,
        key === "ebitdaMax" ? value : ebitdaMax,
        changed
      );
      ebitdaMin = pair.min;
      ebitdaMax = pair.max;
    }

    const nextDraft = { revenueMin, revenueMax, ebitdaMin, ebitdaMax };
    setRangeDraft(nextDraft);
    skipRangeDebounce.current = true;
    commitRangeDraft(nextDraft);
  };

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setRangeDraft(pickRange(EMPTY_FILTERS));
    skipRangeDebounce.current = true;
    navigate(EMPTY_FILTERS, 1);
  };

  const clearLocation = () => updateFilter("location", "");
  const clearSector = () => updateFilter("sector", "");

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

  const hasAnyFilter = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5">
      <PrimarySectorFilter
        selectedSector={filters.sector}
        onSectorChange={(value) => updateFilter("sector", value)}
        countsBySector={sectorCounts}
        totalCount={catalogTotal}
      />

      <CompaniesResultsBar
        total={total}
        sectorSlug={filters.sector}
        location={filters.location}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onClearSector={filters.sector ? clearSector : undefined}
        onClearLocation={filters.location ? clearLocation : undefined}
      />

      <CompaniesFilters
        sector={filters.sector}
        location={filters.location}
        revenueMin={rangeDraft.revenueMin}
        revenueMax={rangeDraft.revenueMax}
        ebitdaMin={rangeDraft.ebitdaMin}
        ebitdaMax={rangeDraft.ebitdaMax}
        sectorOptions={sectorOptions}
        onSectorChange={(value) => updateFilter("sector", value)}
        onLocationChange={(value) => updateFilter("location", value)}
        onRevenueMinChange={(value) => updateRangeField("revenueMin", value)}
        onRevenueMaxChange={(value) => updateRangeField("revenueMax", value)}
        onEbitdaMinChange={(value) => updateRangeField("ebitdaMin", value)}
        onEbitdaMaxChange={(value) => updateRangeField("ebitdaMax", value)}
        onClearFilters={clearAllFilters}
      />

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isLoggedIn={isLoggedIn}
              isFavorite={favoriteSet.has(company.id)}
              ctaLabel="Más información"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/[0.1] bg-[var(--surface-card)] px-6 py-14 text-center">
          <p className="text-base font-semibold text-[var(--foreground)]">
            No hay empresas con estos filtros
          </p>
          <p className="mt-2 text-sm text-[var(--foreground)]/60 max-w-md mx-auto">
            Prueba otro sector, amplía la ubicación o ajusta los rangos de facturación y EBITDA.
          </p>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 inline-flex items-center rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
            >
              Ver todas las empresas
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-[var(--surface-card)] px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          aria-label="Paginación de empresas"
        >
          <p className="text-sm text-[var(--foreground)]/60 order-2 sm:order-1">
            Página <span className="font-semibold text-[var(--foreground)]">{currentPage}</span> de{" "}
            <span className="font-semibold text-[var(--foreground)]">{totalPages}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 sm:order-2">
            <PaginationButton
              disabled={currentPage <= 1}
              onClick={() => navigate(filters, 1)}
              href={currentPage <= 1 ? undefined : pathname + buildQuery({ ...filters, page: 1 })}
              label="Primera página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              disabled={currentPage <= 1}
              onClick={() => navigate(filters, currentPage - 1)}
              href={
                currentPage <= 1
                  ? undefined
                  : pathname + buildQuery({ ...filters, page: currentPage - 1 })
              }
              label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-0.5">Anterior</span>
            </PaginationButton>

            {pageNumbers.map((p, i, arr) => (
              <span key={p} className="inline-flex items-center">
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span className="px-1.5 text-[var(--foreground)]/40 text-sm">…</span>
                )}
                {p === currentPage ? (
                  <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white text-sm font-semibold shadow-sm">
                    {p}
                  </span>
                ) : (
                  <a
                    href={pathname + buildQuery({ ...filters, page: p })}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(filters, p);
                    }}
                    className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--brand-primary)]/10 transition"
                  >
                    {p}
                  </a>
                )}
              </span>
            ))}

            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => navigate(filters, currentPage + 1)}
              href={
                currentPage >= totalPages
                  ? undefined
                  : pathname + buildQuery({ ...filters, page: currentPage + 1 })
              }
              label="Página siguiente"
            >
              <span className="hidden sm:inline mr-0.5">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => navigate(filters, totalPages)}
              href={
                currentPage >= totalPages
                  ? undefined
                  : pathname + buildQuery({ ...filters, page: totalPages })
              }
              label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </nav>
      )}
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  href,
  label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  href?: string;
  label: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (disabled) e.preventDefault();
        else {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={label}
      aria-disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 sm:px-3 py-2 text-sm font-medium transition ${
        disabled
          ? "pointer-events-none text-[var(--foreground)]/30"
          : "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
      }`}
    >
      {children}
    </a>
  );
}
