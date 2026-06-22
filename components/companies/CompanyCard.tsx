"use client";

import Link from "next/link";
import { MapPin, TrendingUp, BarChart3, Users, ChevronRight, Wallet } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { formatCompactAmountValue } from "@/lib/format-financial";
import { getSectorVisual } from "@/lib/sector-visual";
import SectorVisual from "./SectorVisual";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  /** Versión más compacta para listados con varias cartas */
  compact?: boolean;
  /** Texto del botón inferior (por defecto solicitar información) */
  ctaLabel?: string;
};

export default function CompanyCard({
  company,
  compact = false,
  ctaLabel = "Solicitar información",
}: Props) {
  const sectorVisual = getSectorVisual(company.sector);
  const descMax = compact ? 100 : 140;
  const descriptionPreview =
    company.description.length > descMax
      ? company.description.slice(0, descMax) + "…"
      : company.description;

  const annualRevenue = company.gmv ?? company.revenue;
  const revenueOrGmv = {
    label: "Facturación anual €",
    value: annualRevenue || "—",
    icon: BarChart3,
    title: "Facturación anual en euros",
    isFinancial: true,
  };
  const metrics = [
    revenueOrGmv,
    { label: "EBITDA", value: company.ebitda || "—", icon: TrendingUp, title: "EBITDA", isFinancial: true },
    {
      label: "Resultado ejercicio",
      value: company.exerciseResult || "—",
      icon: Wallet,
      title: "Resultado del ejercicio (beneficio neto)",
      isFinancial: true,
    },
    {
      label: "Nº Empleados",
      value: company.employees != null ? String(company.employees) : "—",
      icon: Users,
      title: "Número de empleados",
      isFinancial: false,
    },
  ];

  const cardContent = (
    <div className={`${compact ? "p-4" : "p-5"} flex flex-1 flex-col`}>
      <div className="flex items-start gap-3">
        <SectorVisual sector={company.sector} compact={compact} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-[var(--foreground)] leading-snug break-words ${
                compact ? "text-[15px] min-h-[2.4rem]" : "text-base min-h-[2.6rem]"
              }`}
            >
              {company.name}
            </h3>
            <span
              className={`rounded-md font-normal text-[var(--foreground)]/55 shrink-0 ${
                compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 opacity-60" />
                {company.location}
              </span>
            </span>
          </div>
          <p
            className={`mt-1 text-[var(--foreground)]/45 leading-tight ${
              compact ? "text-[10px]" : "text-[11px]"
            }`}
          >
            {sectorVisual.label}
          </p>
        </div>
      </div>

      <p
        className={`text-[var(--foreground)]/70 leading-relaxed line-clamp-3 ${
          compact ? "mt-2.5 text-xs h-[3.4rem]" : "mt-3 text-sm h-[4.2rem]"
        }`}
      >
        {descriptionPreview}
      </p>

      <div
        className={`${compact ? "mt-3" : "mt-4"} rounded-lg border border-black/[0.05] bg-[var(--surface-muted)]/50 p-2`}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {metrics.map(({ label, value, icon: Icon, title, isFinancial }) => (
            <div
              key={label}
              title={title}
              className={`rounded-md bg-[var(--surface-card)] px-2 py-1.5 ${
                compact ? "" : "py-2"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Icon className="h-3 w-3 shrink-0 text-[var(--foreground)]/35" />
                <p
                  className={`font-normal text-[var(--foreground)]/50 text-center leading-tight ${
                    compact ? "text-[9px]" : "text-[10px]"
                  }`}
                >
                  {label}
                </p>
              </div>
              <p
                className={`mt-0.5 font-semibold text-[var(--foreground)] text-center ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                {isFinancial ? formatFinancialText(value) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={`pt-3 border-t border-black/[0.05] mt-auto ${compact ? "mt-3" : "mt-4"}`}>
        <Link
          href={`/companies/${company.id}`}
          className={`flex items-center justify-center gap-1.5 w-full rounded-lg font-semibold border-2 transition hover:brightness-[0.97] active:scale-[0.99] ${
            compact ? "py-2 text-xs" : "py-2.5 text-sm"
          }`}
          style={{
            borderColor: sectorVisual.accent,
            backgroundColor: `${sectorVisual.accent}18`,
            color: sectorVisual.accent,
          }}
        >
          {ctaLabel}
          <ChevronRight className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </Link>
      </div>
    </div>
  );

  const wrapperClass =
    "h-full w-full rounded-xl border border-black/[0.06] bg-[var(--surface-card)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-black/[0.08] transition block text-left overflow-hidden flex flex-col";

  return <div className={wrapperClass}>{cardContent}</div>;
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
