"use client";

import { ChevronDown, MapPin, SlidersHorizontal } from "lucide-react";
import { SPAIN_CCAA_OPTIONS } from "@/lib/spain-ccaa";
import {
  getFinancialMaxOptions,
  getFinancialMinOptions,
} from "@/lib/financial-range-options";

export type CompaniesDetailFilters = {
  sector: string;
  location: string;
  revenueMin: string;
  revenueMax: string;
  ebitdaMin: string;
  ebitdaMax: string;
};

type SectorOption = { value: string; label: string };

type Props = CompaniesDetailFilters & {
  sectorOptions: SectorOption[];
  onSectorChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRevenueMinChange: (value: string) => void;
  onRevenueMaxChange: (value: string) => void;
  onEbitdaMinChange: (value: string) => void;
  onEbitdaMaxChange: (value: string) => void;
  onClearFilters: () => void;
};

const fieldLabel = "text-xs font-semibold text-[var(--brand-dark)]";

const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-black/[0.12] bg-white py-2 text-sm font-medium text-[var(--brand-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/25 focus:border-[var(--brand-primary)]/30";

function RangeSelect({
  idPrefix,
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  idPrefix: string;
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}) {
  const minChoices = getFinancialMinOptions(minValue, maxValue);
  const maxChoices = getFinancialMaxOptions(minValue, maxValue);

  return (
    <div className="min-w-[11.5rem] flex-1">
      <span className={fieldLabel}>{label}</span>
      <div className="mt-1 flex items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <select
            id={`${idPrefix}-min`}
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            className={`${selectClass} w-full px-2.5 pr-7`}
            aria-label={`${label} mínimo`}
          >
            {minChoices.map((opt) => (
              <option key={`min-${opt.value || "any"}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--brand-dark)]/45"
            aria-hidden
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-[var(--brand-dark)]/40">—</span>
        <div className="relative min-w-0 flex-1">
          <select
            id={`${idPrefix}-max`}
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            className={`${selectClass} w-full px-2.5 pr-7`}
            aria-label={`${label} máximo`}
          >
            {maxChoices.map((opt) => (
              <option key={`max-${opt.value || "any"}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--brand-dark)]/45"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
  icon: Icon,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={`min-w-[9.5rem] flex-1 ${className}`}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className="relative mt-1">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--brand-dark)]/45" />
        ) : null}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${selectClass} ${Icon ? "pl-8 pr-8" : "px-3 pr-8"}`}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--brand-dark)]/45"
          aria-hidden
        />
      </div>
    </div>
  );
}

export default function CompaniesFilters({
  sector,
  location,
  revenueMin,
  revenueMax,
  ebitdaMin,
  ebitdaMax,
  sectorOptions,
  onSectorChange,
  onLocationChange,
  onRevenueMinChange,
  onRevenueMaxChange,
  onEbitdaMinChange,
  onEbitdaMaxChange,
  onClearFilters,
}: Props) {
  const hasActiveFilters = Boolean(
    sector || location || revenueMin || revenueMax || ebitdaMin || ebitdaMax
  );

  return (
    <section
      className="rounded-xl border border-black/[0.06] bg-[var(--surface-card)] px-3 py-3 sm:px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      aria-label="Búsqueda detallada"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-primary)]">
          <SlidersHorizontal className="h-4 w-4" />
          Búsqueda detallada
        </span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-end gap-x-3 gap-y-3">
        <FilterSelect
          id="filter-sector"
          label="Sector"
          value={sector}
          onChange={onSectorChange}
          className="sm:max-w-[11.5rem]"
        >
          <option value="">Todos</option>
          {sectorOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="filter-location"
          label="Ubicación"
          value={location}
          onChange={onLocationChange}
          icon={MapPin}
          className="sm:max-w-[13rem]"
        >
          <option value="">Todas</option>
          {SPAIN_CCAA_OPTIONS.filter((opt) => opt.value).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </FilterSelect>

        <RangeSelect
          idPrefix="revenue"
          label="Facturación"
          minValue={revenueMin}
          maxValue={revenueMax}
          onMinChange={onRevenueMinChange}
          onMaxChange={onRevenueMaxChange}
        />

        <RangeSelect
          idPrefix="ebitda"
          label="EBITDA"
          minValue={ebitdaMin}
          maxValue={ebitdaMax}
          onMinChange={onEbitdaMinChange}
          onMaxChange={onEbitdaMaxChange}
        />
      </div>
    </section>
  );
}
