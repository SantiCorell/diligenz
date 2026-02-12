"use client";

import Link from "next/link";
import CompanyCard from "./CompanyCard";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

export default function FeaturedCompanies() {
  return (
    <section className="bg-[var(--brand-bg)] py-10 md:py-12 border-t border-[var(--brand-primary)]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-[var(--brand-primary)]">
          Empresas destacadas
        </h2>
        <p className="mt-2 text-center text-sm sm:text-base text-[var(--foreground)] opacity-85">
          Oportunidades reales, verificadas y confidenciales
        </p>

        <p className="sm:hidden mt-6 text-center text-xs text-[var(--foreground)] opacity-70">
          Desliza para ver empresas →
        </p>

        <div className="mt-6 sm:mt-8 md:mt-10 flex sm:grid overflow-x-auto sm:overflow-visible gap-4 sm:gap-6 pb-3 sm:pb-0 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_COMPANIES.slice(0, 3).map((company, i) => (
            <div key={company.id} className="min-w-[280px] max-w-[280px] sm:min-w-0 sm:max-w-none shrink-0 snap-center sm:snap-align-none">
              <CompanyCard
                company={company}
                isLoggedIn
                linkToFicha
                compact
                positionInGroup={i}
              />
            </div>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Ver todas las empresas
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
