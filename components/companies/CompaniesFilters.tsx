"use client";

type Props = {
  sector: string;
  location: string;
  onSectorChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  sectors: { value: string; label: string }[];
  locations: string[];
};

export default function CompaniesFilters({
  sector,
  location,
  onSectorChange,
  onLocationChange,
  sectors,
  locations,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)]">
      <span className="text-sm font-medium text-[var(--brand-primary)]">Filtros:</span>
      <select
        value={sector}
        onChange={(e) => onSectorChange(e.target.value)}
        className="rounded-lg border border-[var(--brand-primary)]/30 bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50"
      >
        {sectors.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        className="rounded-lg border border-[var(--brand-primary)]/30 bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50"
      >
        <option value="">Todas las ubicaciones</option>
        {locations.filter(Boolean).map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      {(sector || location) && (
        <button
          type="button"
          onClick={() => {
            onSectorChange("");
            onLocationChange("");
          }}
          className="text-sm text-[var(--brand-primary)] hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
