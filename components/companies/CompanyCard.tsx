"use client";

import Link from "next/link";
import type { CompanyMock } from "@/lib/mock-companies";

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
    company.description.length > 120
      ? company.description.slice(0, 120) + "…"
      : company.description;

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-lg font-semibold text-[var(--brand-primary)]">
            {company.name}
          </h4>
          <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">
            {company.sector} · {company.location}
          </p>
        </div>
        <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--brand-primary)] shrink-0">
          Confidencial
        </span>
      </div>

      <p className="mt-4 text-sm text-[var(--foreground)] opacity-85 leading-relaxed">
        {descriptionPreview}
      </p>

      <div className={`mt-6 ${showBlur ? "relative select-none" : ""}`}>
        {showBlur && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[var(--brand-bg)]/80 backdrop-blur-md z-10 border border-[var(--brand-primary)]/10"
            aria-hidden
          >
            <p className="text-sm font-medium text-[var(--brand-primary)] px-4 text-center">
              Facturación, EBITDA y datos completos
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRequestAuth?.();
              }}
              className="mt-3 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Regístrate para ver la ficha completa
            </button>
          </div>
        )}
        <div className={`grid grid-cols-2 gap-4 ${showBlur ? "blur-sm pointer-events-none" : ""}`}>
          <div>
            <p className="text-xs text-[var(--foreground)] opacity-70">Facturación</p>
            <p className="mt-1 text-base font-semibold text-[var(--brand-primary)]">
              {company.revenue}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--foreground)] opacity-70">EBITDA</p>
            <p className="mt-1 text-base font-semibold text-[var(--brand-primary)]">
              {company.ebitda}
            </p>
          </div>
        </div>
      </div>

      {!showBlur && (
        <div className="mt-6">
          {linkToFicha ? (
            <Link
              href={`/companies/${company.id}`}
              className="block w-full rounded-xl bg-[var(--brand-primary)] py-3 text-center text-sm font-medium text-white hover:opacity-90"
            >
              Ver ficha completa
            </Link>
          ) : (
            <button
              type="button"
              className="w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Solicitar información
            </button>
          )}
        </div>
      )}
    </>
  );

  const wrapperClass =
    "w-full rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] p-6 shadow-sm hover:shadow-md transition block";

  if (linkToFicha) {
    return (
      <Link href={`/companies/${company.id}`} className={wrapperClass}>
        {cardContent}
      </Link>
    );
  }

  return <div className={wrapperClass}>{cardContent}</div>;
}
