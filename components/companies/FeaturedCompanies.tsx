"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CompanyCard from "./CompanyCard";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

const CARDS_PER_VIEW = 3;

export default function FeaturedCompanies() {
  const [index, setIndex] = useState(0);
  const totalSlides = Math.max(1, MOCK_COMPANIES.length - CARDS_PER_VIEW + 1);
  const visibleCompanies = MOCK_COMPANIES.slice(index, index + CARDS_PER_VIEW);

  const next = () =>
    setIndex((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
  const prev = () =>
    setIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));

  useEffect(() => {
    const interval = setInterval(next, 8000);
    return () => clearInterval(interval);
  }, []);

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
          {visibleCompanies.map((company, i) => (
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

        {MOCK_COMPANIES.length > CARDS_PER_VIEW && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="rounded-full border-2 border-[var(--brand-primary)]/30 px-5 py-2.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
            >
              ← Anterior
            </button>
            <span className="text-sm text-[var(--foreground)] opacity-70">
              {index + 1} – {Math.min(index + CARDS_PER_VIEW, MOCK_COMPANIES.length)} / {MOCK_COMPANIES.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="rounded-full border-2 border-[var(--brand-primary)]/30 px-5 py-2.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
            >
              Siguiente →
            </button>
          </div>
        )}

        <p className="mt-8 text-center">
          <Link
            href="/companies"
            className="text-[var(--brand-primary)] font-medium hover:underline"
          >
            Ver todas las empresas →
          </Link>
        </p>
      </div>
    </section>
  );
}
