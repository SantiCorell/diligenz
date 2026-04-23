"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp, BarChart3, Users, ChevronRight, Wallet, BriefcaseBusiness } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { getDefaultCompanyImageUrl } from "@/lib/default-company-images";
import { formatCompactAmountValue } from "@/lib/format-financial";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  /** Posición en un grupo de cartas (0, 1, 2…) para que las adyacentes no repitan imagen */
  positionInGroup?: number;
  /** Versión más compacta para listados con varias cartas */
  compact?: boolean;
  /** Texto del botón inferior (por defecto solicitar información) */
  ctaLabel?: string;
};

export default function CompanyCard({
  company,
  positionInGroup,
  compact = false,
  ctaLabel = "Solicitar información",
}: Props) {
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

  const cardImageSrc = company.heroImageSrc ?? getDefaultCompanyImageUrl(company, positionInGroup);

  const cardContent = (
    <>
      <div
        className={`relative w-full overflow-hidden bg-[var(--brand-bg-lavender)] ${
          compact ? "aspect-[16/9]" : "aspect-[16/9]"
        }`}
      >
        <Image
          src={cardImageSrc}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? "(max-width: 480px) 100vw, 280px" : "(max-width: 480px) 100vw, 400px"}
          unoptimized={Boolean(company.heroImageSrc) || cardImageSrc.includes("unsplash.com")}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>
      <div className={`${compact ? "p-4 pt-3" : "p-5 pt-3.5"} flex flex-1 flex-col`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className={`font-bold text-[var(--foreground)] leading-tight break-words ${
                compact ? "text-lg min-h-[3.8rem]" : "text-[2rem] min-h-[5.4rem]"
              }`}
            >
              {company.name}
            </h3>
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-primary)]/10 bg-[var(--brand-bg-lavender)]/75 text-[var(--foreground)] ${
                compact ? "mt-1 px-2 py-1 text-[11px]" : "mt-2 px-2.5 py-1 text-xs"
              }`}
            >
              <BriefcaseBusiness className="w-3.5 h-3.5 shrink-0 text-[var(--brand-primary)]/75" />
              <span>{company.sector}</span>
            </div>
          </div>
          <span
            className={`rounded-lg bg-[var(--brand-primary)]/12 font-semibold text-[var(--brand-primary)] shrink-0 ${
              compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <MapPin className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              {company.location}
            </span>
          </span>
        </div>

        <p
          className={`text-[var(--foreground)] opacity-90 leading-relaxed line-clamp-3 ${
            compact ? "mt-2 text-xs min-h-[3.4rem]" : "mt-3.5 text-sm min-h-[4.9rem]"
          }`}
        >
          {descriptionPreview}
        </p>

        <div className={`${compact ? "mt-3" : "mt-4"} rounded-2xl bg-[var(--brand-bg-lavender)]/88 border border-[var(--brand-primary)]/12 p-2.5`}>
          <div className="grid grid-cols-2 gap-2">
            {metrics.map(({ label, value, icon: Icon, title, isFinancial }) => (
              <div
                key={label}
                title={title}
                className={`rounded-xl border border-[var(--brand-primary)]/8 bg-white/45 backdrop-blur-[1px] ${
                  compact ? "px-2 py-1.5" : "px-3 py-2.5"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Icon className={`text-[var(--brand-primary)]/70 shrink-0 ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
                  <p
                    className={`font-medium text-[var(--foreground)] opacity-75 text-center leading-tight ${
                      compact ? "text-[10px]" : "text-xs"
                    }`}
                  >
                    {label}
                  </p>
                </div>
                <p
                  className={`mt-0.5 font-bold text-[var(--brand-primary)] text-center ${
                    compact ? "text-xs" : "text-sm"
                  }`}
                >
                  {isFinancial ? formatFinancialText(value) : value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`pt-3 border-t border-[var(--brand-primary)]/10 mt-auto ${compact ? "mt-3" : "mt-4 pt-3.5"}`}>
          <Link
            href={`/companies/${company.id}`}
            className={`flex items-center justify-center gap-2 w-full rounded-xl font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 transition ${compact ? "py-2.5 text-xs" : "py-3 text-sm"}`}
          >
            {ctaLabel}
            <ChevronRight className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </Link>
        </div>
      </div>
    </>
  );

  const wrapperClass = compact
    ? "h-full w-full rounded-2xl border border-[var(--brand-primary)]/10 bg-white shadow-md hover:shadow-lg hover:border-[var(--brand-primary)]/20 transition block text-left overflow-hidden flex flex-col"
    : "h-full w-full rounded-2xl border border-[var(--brand-primary)]/10 bg-white shadow-md hover:shadow-lg hover:border-[var(--brand-primary)]/20 transition block text-left overflow-hidden flex flex-col";

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
