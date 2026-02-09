"use client";

import Link from "next/link";
import CompanyCard from "./CompanyCard";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

export default function FeaturedCompanies() {
  return (
    <section className="bg-[var(--brand-bg)] py-12 md:py-16 border-t border-[var(--brand-primary)]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-semibold text-[var(--brand-primary)]">
          Empresas destacadas
        </h2>
        <p className="mt-3 text-center text-lg text-[var(--foreground)] opacity-85">
          Oportunidades reales, verificadas y confidenciales
        </p>

        <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_COMPANIES.map((company, i) => (
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

        <p className="mt-10 text-center">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white font-medium hover:opacity-90 transition"
          >
            Ver todas las empresas
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
