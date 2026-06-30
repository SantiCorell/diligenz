"use client";

import Link from "next/link";
import { Hash, MapPin } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { formatEuroAmountFromString, formatEuroRange } from "@/lib/format-financial";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { getSectorVisual } from "@/lib/sector-visual";
import SectorIcon from "@/components/companies/SectorIcon";
import CompanyFavoriteButton from "@/components/companies/CompanyFavoriteButton";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  isFavorite?: boolean;
  /** Versión más compacta para carruseles */
  compact?: boolean;
  ctaLabel?: string;
};

export default function CompanyCard({
  company,
  isLoggedIn = false,
  isFavorite = false,
  compact = false,
  ctaLabel = "Más información",
}: Props) {
  const sectorVisual = getSectorVisual(company.sector);
  const descMax = compact ? 120 : 140;
  const descriptionPreview =
    company.description.length > descMax
      ? company.description.slice(0, descMax) + "…"
      : company.description;

  const annualRevenue = company.revenue?.trim() || company.gmv?.trim() || "—";
  const salePrice =
    company.valuationSaleMin != null || company.valuationSaleMax != null
      ? formatEuroRange(company.valuationSaleMin, company.valuationSaleMax) ?? "—"
      : null;
  const metrics = [
    { label: "Facturación anual €", value: annualRevenue, isFinancial: true },
    { label: "EBITDA", value: company.ebitda || "—", isFinancial: true },
    ...(salePrice
      ? [{ label: "Precio de venta", value: salePrice, isFinancial: false as const }]
      : []),
    { label: "Resultado ejercicio", value: company.exerciseResult || "—", isFinancial: true },
    {
      label: "Nº Empleados",
      value: company.employees != null ? String(company.employees) : "—",
      isFinancial: false,
    },
  ];

  return (
    <div className="company-card-hover-wrap h-full">
      <article
        className={`company-card-shell flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--brand-bg-lavender)]/55 ${
          compact ? "min-h-[300px] p-3.5 sm:min-h-[320px] sm:p-4" : "min-h-[300px] p-4 sm:min-h-[320px]"
        }`}
      >
        <div className="grid h-full min-h-0 flex-1 grid-cols-2 gap-2.5 sm:gap-3">
          {/* Panel izquierdo — ficha blanca */}
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white p-3 sm:p-3.5">
            <div className="flex min-h-0 items-start gap-2">
              <p
                className={`min-w-0 flex-1 leading-snug text-[var(--foreground)]/75 ${
                  compact ? "text-xs line-clamp-3 sm:text-[13px]" : "text-[13px] line-clamp-5 sm:text-sm"
                }`}
              >
                {descriptionPreview}
              </p>
              <SectorIcon sector={company.sector} size="sm" />
            </div>

            <div className="mt-auto shrink-0 space-y-1.5 pt-3 sm:space-y-2 sm:pt-4">
            {metrics.map(({ label, value, isFinancial }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] leading-tight text-[var(--foreground)]/60 sm:text-xs">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" aria-hidden />
                  {label}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-dark)] sm:text-xs">
                  {isFinancial ? formatEuroAmountFromString(value) : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — tags, nombre y CTA */}
        <div className="flex h-full min-h-0 min-w-0 flex-col justify-between rounded-2xl p-2.5 sm:p-3">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${sectorVisual.tagClass}`}
              >
                {sectorVisual.shortLabel}
              </span>
              <span className="inline-flex max-w-[55%] items-center gap-1 rounded-full border border-[var(--brand-primary)]/15 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[var(--brand-dark)]/75 sm:text-xs">
                <MapPin className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                <span className="truncate">{ccaaLabel(company.location)}</span>
              </span>
            </div>
            <h3
              className={`mt-3 font-bold leading-tight text-[var(--brand-dark)] ${
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
              }`}
            >
              {company.name}
            </h3>
            {company.reference ? (
              <p
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-[var(--brand-primary)]/20 bg-white/90 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-[var(--brand-primary)] sm:text-xs"
                title="Referencia para solicitar información"
              >
                <Hash className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                {company.reference}
              </p>
            ) : null}
          </div>

          <div className="mt-auto w-full shrink-0 pt-3">
            {isLoggedIn ? (
              <div className="mb-1.5 flex justify-end pr-0.5">
                <CompanyFavoriteButton
                  companyId={company.id}
                  initialFavorite={isFavorite}
                  variant="icon"
                  size="sm"
                />
              </div>
            ) : null}
            <Link
              href={`/companies/${company.id}`}
              className={`flex w-full items-center justify-center rounded-full bg-[var(--brand-primary)] font-semibold text-white shadow-md shadow-[var(--brand-primary)]/25 transition hover:opacity-95 ${
                compact ? "py-2.5 text-sm" : "py-3.5 text-sm sm:text-base"
              }`}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
    </div>
  );
}
