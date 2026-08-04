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

function descriptionBullets(description: string): string[] {
  return description
    .split(/,| y /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default function PrimarySectorFilter({
  selectedSector,
  onSectorChange,
  countsBySector,
  totalCount,
}: Props) {
  const allActive = !selectedSector;

  const cards = [
    {
      value: "",
      title: "Todos",
      bullets: ["Ver todo el catálogo", "Todos los sectores", "Filtros combinables"],
      count: totalCount,
      active: allActive,
      icon: (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
          <LayoutGrid className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
      ),
    },
    ...PRIMARY_SECTOR_OPTIONS.map((sector) => {
      const visual = getSectorVisual(sector.value);
      const Icon = visual.icon;
      return {
        value: sector.value,
        title: sector.shortLabel,
        bullets: descriptionBullets(sector.description),
        count: countsBySector[sector.value] ?? 0,
        active: selectedSector === sector.value,
        icon: (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${visual.iconBgClass}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
        ),
      };
    }),
  ];

  return (
    <section
      className="mb-8 rounded-[1.75rem] bg-[var(--brand-surface)] px-4 py-8 sm:mb-10 sm:px-6 sm:py-9 md:mb-12"
      aria-label="Filtrar por sector principal"
    >
      <div className="mb-7 text-center">
        <p className="page-eyebrow">Sectores</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
          ¿Qué tipo de empresa buscas?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--brand-dark)]/60 sm:text-base">
          Elige un sector. Los resultados se actualizan al instante ·{" "}
          <span className="font-semibold text-[var(--brand-primary)]">{totalCount}</span>{" "}
          {totalCount === 1 ? "empresa" : "empresas"} en catálogo
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <button
            key={card.value || "all"}
            type="button"
            onClick={() => onSectorChange(card.value)}
            aria-pressed={card.active}
            className={`group flex flex-col gap-3 rounded-[1.35rem] bg-white p-5 text-left shadow-sm outline-none transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(145,70,255,0.35)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 ${
              card.active
                ? "ring-2 ring-[var(--brand-primary)]/35 shadow-[0_12px_32px_-16px_rgba(145,70,255,0.4)]"
                : ""
            }`}
          >
            {card.icon}

            <h3 className="text-lg font-extrabold tracking-tight text-[var(--brand-dark)]">
              {card.title}
            </h3>

            <ul className="flex flex-1 flex-col gap-1.5 text-sm text-[var(--brand-dark)]/65">
              {card.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-extrabold text-[var(--brand-primary)]" aria-hidden>
                    ·
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <span
              className={`mt-1 inline-flex self-start rounded-full px-3.5 py-1.5 text-xs font-extrabold ${
                card.count === 0 && !card.active
                  ? "bg-[var(--brand-surface)] text-[var(--brand-dark)]/50"
                  : "bg-[var(--brand-accent)] text-[var(--brand-dark)]"
              }`}
            >
              {card.count} {card.count === 1 ? "empresa" : "empresas"}
            </span>

            <span className="text-sm font-bold text-[var(--brand-primary)] group-hover:underline group-hover:underline-offset-4">
              {card.active ? "Filtro activo →" : "Ver empresas →"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
