"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp, BarChart3, Globe, Users, ChevronRight } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { getDefaultCompanyImageUrl } from "@/lib/default-company-images";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  onRequestAuth?: () => void;
  linkToFicha?: boolean;
  /** Posición en un grupo de cartas (0, 1, 2…) para que las adyacentes no repitan imagen */
  positionInGroup?: number;
  /** Versión más compacta para listados con varias cartas */
  compact?: boolean;
};

export default function CompanyCard({
  company,
  isLoggedIn = false,
  onRequestAuth,
  linkToFicha: _linkToFicha = false,
  positionInGroup,
  compact = false,
}: Props) {
  const showBlur = !isLoggedIn && onRequestAuth;
  const descMax = compact ? 100 : 140;
  const descriptionPreview =
    company.description.length > descMax
      ? company.description.slice(0, descMax) + "…"
      : company.description;

  // Si hay GMV mostramos GMV; si no, Facturación (no ambos)
  const revenueOrGmv = company.gmv
    ? { label: "GMV", value: company.gmv, icon: Globe, title: "Volumen de negocio (Gross Merchandise Value)" }
    : { label: "Facturación", value: company.revenue, icon: BarChart3, title: "Ingresos anuales" };
  const metrics = [
    revenueOrGmv,
    { label: "EBITDA", value: company.ebitda, icon: TrendingUp, title: "EBITDA" },
    ...(company.employees != null
      ? [{ label: "Nº Empleados", value: String(company.employees), icon: Users, title: "Número de empleados" }]
      : []),
  ];

  const defaultImageUrl = getDefaultCompanyImageUrl(company, positionInGroup);

  const cardContent = (
    <>
      <div className={`relative w-full overflow-hidden bg-[var(--brand-bg-lavender)] border border-[var(--brand-primary)]/10 rounded-xl ${compact ? "aspect-[16/9] -mx-4 -mt-4 mb-3" : "aspect-[16/10] rounded-xl -mx-6 -mt-6 mb-4"}`}>
        <Image
          src={defaultImageUrl}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? "(max-width: 480px) 100vw, 280px" : "(max-width: 480px) 100vw, 400px"}
          unoptimized
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-[var(--foreground)] truncate ${compact ? "text-lg" : "text-2xl"}`}>
            {company.name}
          </h3>
          <div className={`flex items-center gap-1.5 text-[var(--foreground)] opacity-75 ${compact ? "mt-1 text-xs" : "mt-1.5 text-sm"}`}>
            <MapPin className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/70" />
            <span>{company.location}</span>
          </div>
        </div>
        <span className={`rounded-lg bg-[var(--brand-primary)]/10 font-semibold text-[var(--brand-primary)] shrink-0 ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}>
          {company.sector}
        </span>
      </div>

      <p className={`text-[var(--foreground)] opacity-90 leading-relaxed line-clamp-3 ${compact ? "mt-2 text-xs" : "mt-4 text-sm"}`}>
        {descriptionPreview}
      </p>

      <div className={`mt-5 ${showBlur ? "relative select-none" : ""}`}>
        {showBlur && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[var(--brand-bg)]/90 backdrop-blur-md z-10 border border-[var(--brand-primary)]/10"
            aria-hidden
          >
            <p className="text-sm font-medium text-[var(--brand-primary)] px-4 text-center">
              Facturación, EBITDA, Nº empleados y datos completos
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRequestAuth?.();
              }}
              className="mt-3 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Regístrate para ver la ficha completa
            </button>
          </div>
        )}
        <div className={`grid gap-2 ${metrics.length === 3 ? "grid-cols-3" : "grid-cols-2"} ${showBlur ? "blur-sm pointer-events-none" : ""}`}>
          {metrics.map(({ label, value, icon: Icon, title }) => (
            <div
              key={label}
              title={title}
              className={`rounded-xl bg-[var(--brand-bg-lavender)]/60 border border-[var(--brand-primary)]/10 ${compact ? "px-2 py-1.5" : "px-3 py-2.5"}`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`text-[var(--brand-primary)]/70 shrink-0 ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
                <p className={`font-medium text-[var(--foreground)] opacity-75 ${compact ? "text-[10px]" : "text-xs"}`}>
                  {label}
                </p>
              </div>
              <p className={`mt-0.5 font-bold text-[var(--brand-primary)] truncate ${compact ? "text-xs" : "text-sm"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!showBlur && (
        <div className={`pt-3 border-t border-[var(--brand-primary)]/10 ${compact ? "mt-3" : "mt-5 pt-4"}`}>
          <Link
            href={`/companies/${company.id}`}
            className={`flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--brand-primary)] font-semibold text-white hover:opacity-90 transition ${compact ? "py-2 text-xs" : "py-3 text-sm"}`}
          >
            Solicitar información
            <ChevronRight className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </Link>
        </div>
      )}
    </>
  );

  const wrapperClass = compact
    ? "w-full rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] p-4 shadow-sm hover:shadow-md hover:border-[var(--brand-primary)]/25 transition block text-left overflow-hidden"
    : "w-full rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] p-6 shadow-sm hover:shadow-md hover:border-[var(--brand-primary)]/25 transition block text-left overflow-hidden";

  return <div className={wrapperClass}>{cardContent}</div>;
}
