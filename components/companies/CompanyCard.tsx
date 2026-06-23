"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { formatCompactAmountValue } from "@/lib/format-financial";
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
  ctaLabel = "Solicitar información",
}: Props) {
  const sectorVisual = getSectorVisual(company.sector);
  const descMax = compact ? 110 : 130;
  const descriptionPreview =
    company.description.length > descMax
      ? company.description.slice(0, descMax) + "…"
      : company.description;

  const annualRevenue = company.gmv ?? company.revenue;
  const metrics = [
    { label: "Facturación anual €", value: annualRevenue || "—", isFinancial: true },
    { label: "EBITDA", value: company.ebitda || "—", isFinancial: true },
    { label: "Resultado ejercicio", value: company.exerciseResult || "—", isFinancial: true },
    {
      label: "Nº Empleados",
      value: company.employees != null ? String(company.employees) : "—",
      isFinancial: false,
    },
  ];

  return (
    <article className="company-card-shell flex h-full min-h-[280px] flex-col rounded-2xl bg-white p-3 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:min-h-[300px] sm:p-4">
      <div className="grid h-full flex-1 grid-cols-2 gap-2 sm:gap-3">
        {/* Panel izquierdo — ficha blanca */}
        <div className="flex min-w-0 flex-col rounded-xl border border-[var(--surface-muted)] bg-white p-3 sm:p-3.5">
          <div className="flex items-start gap-2">
            <p
              className={`min-w-0 flex-1 leading-snug text-[var(--foreground)]/70 ${
                compact ? "text-[11px] line-clamp-4" : "text-xs line-clamp-5"
              }`}
            >
              {descriptionPreview}
            </p>
            <SectorIcon sector={company.sector} size="sm" />
          </div>

          <div className="mt-auto space-y-1.5 pt-3 sm:space-y-2 sm:pt-4">
            {metrics.map(({ label, value, isFinancial }) => (
              <div key={label} className="flex items-center justify-between gap-1">
                <span className="text-[9px] leading-tight text-[var(--foreground)]/55 sm:text-[10px]">
                  {label}
                </span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-dark)] sm:text-[11px]">
                  {isFinancial ? formatFinancialText(value) : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — tags, nombre y CTA */}
        <div className="flex min-w-0 flex-col justify-between rounded-xl bg-[var(--brand-bg-lavender)]/55 p-3 py-0.5 sm:py-1">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${sectorVisual.tagClass}`}
              >
                {sectorVisual.shortLabel}
              </span>
              <span className="inline-flex max-w-[55%] items-center gap-0.5 rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-medium text-[var(--brand-dark)]/70 sm:text-xs">
                <MapPin className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                <span className="truncate">{company.location}</span>
              </span>
            </div>
            <h3
              className={`mt-3 font-bold leading-tight text-[var(--brand-dark)] ${
                compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
              }`}
            >
              {company.name}
            </h3>
          </div>

          <Link
            href={`/companies/${company.id}`}
            className={`mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] font-semibold text-white shadow-md shadow-[var(--brand-primary)]/25 transition hover:opacity-95 ${
              compact ? "py-2.5 text-xs sm:text-sm" : "py-3 text-sm"
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
