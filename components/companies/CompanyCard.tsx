"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { formatEuroAmountFromString, formatEuroRange } from "@/lib/format-financial";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { getSectorVisual } from "@/lib/sector-visual";
import CompanyFavoriteButton from "@/components/companies/CompanyFavoriteButton";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  isFavorite?: boolean;
  /** Versión más compacta para carruseles */
  compact?: boolean;
  ctaLabel?: string;
};

function MetricCell({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[11px] font-medium leading-tight text-[var(--brand-dark)]/55 sm:text-xs">
        {label}
      </span>
      <b
        className={`mt-0.5 block truncate text-sm font-extrabold tracking-tight sm:text-[15px] ${
          muted ? "font-medium text-[var(--brand-dark)]/45" : "text-[var(--brand-dark)]"
        }`}
      >
        {value}
      </b>
    </div>
  );
}

export default function CompanyCard({
  company,
  isLoggedIn = false,
  isFavorite = false,
  compact = false,
  ctaLabel = "Más información",
}: Props) {
  const sectorVisual = getSectorVisual(company.sector);
  const descMax = compact ? 100 : 160;
  const descriptionPreview =
    company.description.length > descMax
      ? company.description.slice(0, descMax).trimEnd() + "…"
      : company.description;

  const annualRevenueRaw = company.revenue?.trim() || company.gmv?.trim() || "";
  const annualRevenue = annualRevenueRaw
    ? formatEuroAmountFromString(annualRevenueRaw)
    : "—";
  const ebitdaRaw = company.ebitda?.trim() || "";
  const ebitda = ebitdaRaw ? formatEuroAmountFromString(ebitdaRaw) : "—";
  const exerciseRaw = company.exerciseResult?.trim() || "";
  const exercise = exerciseRaw ? formatEuroAmountFromString(exerciseRaw) : "—";
  const employees =
    company.employees != null ? String(company.employees) : "—";

  const salePrice =
    company.valuationSaleMin != null || company.valuationSaleMax != null
      ? formatEuroRange(company.valuationSaleMin, company.valuationSaleMax)
      : null;

  const refLabel = company.reference
    ? company.reference.startsWith("#")
      ? company.reference
      : `# ${company.reference}`
    : null;

  return (
    <div className="company-card-hover-wrap h-full">
      <article
        className={`company-card-shell flex h-full flex-col rounded-[1.5rem] border border-[var(--brand-dark)]/[0.09] bg-white ${
          compact ? "gap-3 p-4 sm:p-5" : "gap-3.5 p-5 sm:gap-4 sm:p-6"
        }`}
      >
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--brand-primary)] sm:text-xs">
            {sectorVisual.shortLabel}
          </span>
          <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[var(--brand-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--brand-dark)]/70 sm:text-xs">
            <MapPin className="h-3 w-3 shrink-0 text-red-500/80" aria-hidden />
            <span className="truncate">{ccaaLabel(company.location)}</span>
          </span>
          {refLabel ? (
            <span className="ml-auto rounded-full border border-[var(--brand-dark)]/12 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-[var(--brand-dark)]/65 sm:text-xs">
              {refLabel}
            </span>
          ) : null}
          {isLoggedIn ? (
            <span className={refLabel ? "" : "ml-auto"}>
              <CompanyFavoriteButton
                companyId={company.id}
                initialFavorite={isFavorite}
                variant="icon"
                size="sm"
              />
            </span>
          ) : null}
        </div>

        {/* Title + description */}
        <div className="min-w-0">
          <h3
            className={`font-extrabold leading-snug tracking-tight text-[var(--brand-dark)] ${
              compact ? "text-lg sm:text-xl" : "text-xl sm:text-[1.35rem]"
            }`}
          >
            {company.name}
          </h3>
          <p
            className={`mt-2 leading-relaxed text-[var(--brand-dark)]/60 ${
              compact ? "line-clamp-2 text-sm" : "line-clamp-2 text-sm sm:text-[15px]"
            }`}
          >
            {descriptionPreview}
          </p>
        </div>

        {/* Metrics — 2×2 en móvil, 4 en desktop → menos apilado */}
        <div
          className={`grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl bg-[var(--brand-surface)] ${
            compact ? "p-3 sm:grid-cols-4 sm:p-3.5" : "p-3.5 sm:grid-cols-4 sm:gap-x-4 sm:p-4"
          }`}
        >
          <MetricCell
            label="Facturación anual"
            value={annualRevenue}
            muted={annualRevenue === "—"}
          />
          <MetricCell label="EBITDA" value={ebitda} muted={ebitda === "—"} />
          <MetricCell
            label="Resultado ejercicio"
            value={exercise}
            muted={exercise === "—"}
          />
          <MetricCell
            label="Nº empleados"
            value={employees}
            muted={employees === "—"}
          />
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-0.5">
          {salePrice ? (
            <span className="inline-flex flex-col rounded-full bg-[var(--brand-accent)] px-4 py-2 leading-tight">
              <small className="text-[10px] font-semibold text-[var(--brand-dark)]/65">
                Precio de venta
              </small>
              <span className="text-sm font-extrabold text-[var(--brand-dark)] sm:text-[15px]">
                {salePrice}
              </span>
            </span>
          ) : (
            <span className="inline-flex flex-col rounded-full bg-[var(--brand-accent)] px-4 py-2 leading-tight">
              <small className="text-[10px] font-semibold text-[var(--brand-dark)]/65">
                Consultar
              </small>
              <span className="text-sm font-extrabold text-[var(--brand-dark)] sm:text-[15px]">
                precio
              </span>
            </span>
          )}

          <Link
            href={`/companies/${company.id}`}
            className={`group inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand-primary)] font-semibold text-white transition hover:opacity-95 ${
              compact ? "px-4 py-2.5 text-sm" : "px-5 py-2.5 text-sm sm:px-6 sm:py-3"
            }`}
          >
            {ctaLabel}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </article>
    </div>
  );
}
