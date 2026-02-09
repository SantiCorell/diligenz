"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp, BarChart3, Globe, ChevronRight } from "lucide-react";
import type { CompanyMock } from "@/lib/mock-companies";
import { getDefaultCompanyImageUrl } from "@/lib/default-company-images";

type Props = {
  company: CompanyMock;
  isLoggedIn?: boolean;
  onRequestAuth?: () => void;
  linkToFicha?: boolean;
};

export default function CompanyCard({
  company,
  isLoggedIn = false,
  onRequestAuth,
  linkToFicha = false,
}: Props) {
  const showBlur = !isLoggedIn && onRequestAuth;
  const descriptionPreview =
    company.description.length > 140
      ? company.description.slice(0, 140) + "…"
      : company.description;

  const metrics = [
    { label: "Facturación", value: company.revenue, icon: BarChart3 },
    { label: "EBITDA", value: company.ebitda, icon: TrendingUp },
    ...(company.gmv ? [{ label: "GMV", value: company.gmv, icon: Globe }] : []),
  ];

  const defaultImageUrl = getDefaultCompanyImageUrl(company);

  const cardContent = (
    <>
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[var(--brand-bg-lavender)] border border-[var(--brand-primary)]/10 -mx-6 -mt-6 mb-4">
        <Image
          src={defaultImageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 480px) 100vw, 400px"
          unoptimized
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-[var(--foreground)] truncate">
            {company.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--foreground)] opacity-75">
            <MapPin className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/70" />
            <span>{company.location}</span>
          </div>
        </div>
        <span className="rounded-lg bg-[var(--brand-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)] shrink-0">
          {company.sector}
        </span>
      </div>

      <p className="mt-4 text-sm text-[var(--foreground)] opacity-90 leading-relaxed line-clamp-3">
        {descriptionPreview}
      </p>

      <div className={`mt-5 ${showBlur ? "relative select-none" : ""}`}>
        {showBlur && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[var(--brand-bg)]/90 backdrop-blur-md z-10 border border-[var(--brand-primary)]/10"
            aria-hidden
          >
            <p className="text-sm font-medium text-[var(--brand-primary)] px-4 text-center">
              Facturación, EBITDA, GMV y datos completos
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
        <div className={`grid gap-3 ${metrics.length === 3 ? "grid-cols-3" : "grid-cols-2"} ${showBlur ? "blur-sm pointer-events-none" : ""}`}>
          {metrics.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl bg-[var(--brand-bg-lavender)]/60 border border-[var(--brand-primary)]/10 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-[var(--brand-primary)]/70 shrink-0" />
                <p className="text-xs font-medium text-[var(--foreground)] opacity-75">
                  {label}
                </p>
              </div>
              <p className="mt-1 text-sm font-bold text-[var(--brand-primary)] truncate">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!showBlur && (
        <div className="mt-5 pt-4 border-t border-[var(--brand-primary)]/10">
          <Link
            href={`/companies/${company.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Solicitar información
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </>
  );

  const wrapperClass =
    "w-full rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] p-6 shadow-sm hover:shadow-md hover:border-[var(--brand-primary)]/25 transition block text-left overflow-hidden";

  return <div className={wrapperClass}>{cardContent}</div>;
}
