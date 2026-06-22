"use client";

import { MapPin, SlidersHorizontal } from "lucide-react";

type Props = {
  location: string;
  onLocationChange: (v: string) => void;
  onClearFilters?: () => void;
  locations: string[];
};

export default function CompaniesFilters({
  location,
  onLocationChange,
  onClearFilters,
  locations,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-black/[0.06] bg-[var(--surface-card)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]/70">
        <SlidersHorizontal className="h-4 w-4 opacity-60" />
        Refinar búsqueda
      </span>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/35" />
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="appearance-none rounded-lg border border-black/[0.08] bg-[var(--surface-card)] pl-9 pr-8 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/25 min-w-[200px]"
          aria-label="Filtrar por ubicación"
        >
          <option value="">Todas las ubicaciones</option>
          {locations.filter(Boolean).map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      {location && (
        <button
          type="button"
          onClick={() => (onClearFilters ? onClearFilters() : onLocationChange(""))}
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          Limpiar ubicación
        </button>
      )}
    </div>
  );
}
