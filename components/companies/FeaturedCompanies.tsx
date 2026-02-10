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

        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COMPANIES.slice(0, 3).map((company, i) => (
            <CompanyCard
              key={company.id}
              company={company}
              isLoggedIn
              linkToFicha
              compact
              positionInGroup={i}
            />
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
