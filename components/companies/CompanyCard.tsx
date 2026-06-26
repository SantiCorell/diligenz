"use client";

import Link from "next/link";
import { Hash, MapPin } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { formatCompactAmountValue } from "@/lib/format-financial";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { getSectorVisual } from "@/lib/sector-visual";
import SectorIcon from "@/components/companies/SectorIcon";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  /** Versión más compacta para carruseles */
  compact?: boolean;
  ctaLabel?: string;
};

export default function CompanyCard({
  company,
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
  const metrics = [
    { label: "Facturación anual €", value: annualRevenue, isFinancial: true },
    { label: "EBITDA", value: company.ebitda || "—", isFinancial: true },
    { label: "Resultado ejercicio", value: company.exerciseResult || "—", isFinancial: true },
    {
      label: "Nº Empleados",
      value: company.employees != null ? String(company.employees) : "—",
      isFinancial: false,
    },
  ];

  return (
    <article
      className={`company-card-shell flex h-full flex-col rounded-[1.75rem] bg-[var(--brand-bg-lavender)]/55 shadow-[0_8px_32px_rgba(145,70,255,0.12)] ${
        compact ? "min-h-[300px] p-3.5 sm:min-h-[320px] sm:p-4" : "min-h-[300px] p-4 sm:min-h-[320px]"
      }`}
    >
      <div className="grid h-full flex-1 grid-cols-2 gap-2.5 sm:gap-3">
        {/* Panel izquierdo — ficha blanca */}
        <div className="flex min-w-0 flex-col rounded-2xl border border-white/80 bg-white p-3.5 sm:p-4">
          <div className="flex items-start gap-2.5">
            <p
              className={`min-w-0 flex-1 leading-relaxed text-[var(--foreground)]/75 ${
                compact ? "text-xs line-clamp-4 sm:text-[13px]" : "text-[13px] line-clamp-5 sm:text-sm"
              }`}
            >
              {descriptionPreview}
            </p>
            <SectorIcon sector={company.sector} size="sm" />
          </div>

          <div className="mt-auto space-y-2 pt-4 sm:space-y-2.5 sm:pt-5">
            {metrics.map(({ label, value, isFinancial }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] leading-tight text-[var(--foreground)]/60 sm:text-xs">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" aria-hidden />
                  {label}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-dark)] sm:text-xs">
                  {isFinancial ? formatFinancialText(value) : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — tags, nombre y CTA */}
        <div className="flex min-w-0 flex-col justify-between rounded-2xl p-3 sm:p-3.5">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${sectorVisual.tagClass}`}
              >
                {sectorVisual.shortLabel}
              </span>
              <span className="inline-flex max-w-[58%] items-center gap-1 rounded-full border border-[var(--brand-primary)]/15 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[var(--brand-dark)]/75 sm:text-xs">
                <MapPin className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                <span className="truncate">{ccaaLabel(company.location)}</span>
              </span>
            </div>
            <h3
              className={`mt-4 font-bold leading-tight text-[var(--brand-dark)] ${
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

          <Link
            href={`/companies/${company.id}`}
            className={`mt-4 flex w-full items-center justify-center rounded-full bg-[var(--brand-primary)] font-semibold text-white shadow-md shadow-[var(--brand-primary)]/25 transition hover:opacity-95 ${
              compact ? "py-3 text-sm" : "py-3.5 text-sm sm:text-base"
            }`}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatFinancialText(value: string): string {
  if (!value || value === "—") return value;

  return value.replace(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(\s*[kKmM])?/g, (token, raw, suffix) => {
    const parsed = parseLocalizedNumber(raw);
    if (parsed == null) return token;

    let absoluteValue = parsed;
    const unit = String(suffix ?? "").trim().toLowerCase();
    if (unit === "m") absoluteValue *= 1_000_000;
    if (unit === "k") absoluteValue *= 1_000;

    return formatCompactAmountValue(absoluteValue);
  });
}

function parseLocalizedNumber(input: string): number | null {
  const value = input.trim();
  if (!value) return null;

  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(value)) {
    const integerText = value.replace(/[.,]/g, "");
    const parsedInteger = Number.parseInt(integerText, 10);
    return Number.isFinite(parsedInteger) ? parsedInteger : null;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
