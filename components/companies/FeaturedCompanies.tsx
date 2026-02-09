"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CompanyCard from "./CompanyCard";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

export default function FeaturedCompanies() {
  const [index, setIndex] = useState(0);
  const company = MOCK_COMPANIES[index % MOCK_COMPANIES.length];

  const next = () =>
    setIndex((prev) => (prev + 1) % MOCK_COMPANIES.length);
  const prev = () =>
    setIndex((prev) =>
      prev === 0 ? MOCK_COMPANIES.length - 1 : prev - 1
    );

  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[var(--brand-bg)] py-24 border-t border-[var(--brand-primary)]/10">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-semibold text-[var(--brand-primary)]">
          Empresas destacadas
        </h2>
        <p className="mt-3 text-center text-lg text-[var(--foreground)] opacity-85">
          Oportunidades reales, verificadas y confidenciales
        </p>

        <div className="mt-16 grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-sm text-[var(--brand-primary)]">
              {company.sector} · {company.location}
            </span>
            <h3 className="mt-4 text-2xl font-semibold text-[var(--brand-primary)]">
              {company.name}
            </h3>
            <p className="mt-4 text-[var(--foreground)] opacity-85 leading-relaxed">
              {company.description}
            </p>
            <div className="mt-8 flex gap-4 text-sm">
              <div>
                <p className="text-[var(--foreground)] opacity-70">Facturación</p>
                <p className="font-semibold text-[var(--brand-primary)]">{company.revenue}</p>
              </div>
              <div>
                <p className="text-[var(--foreground)] opacity-70">EBITDA</p>
                <p className="font-semibold text-[var(--brand-primary)]">{company.ebitda}</p>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button
                onClick={prev}
                className="rounded-full border border-[var(--brand-primary)]/30 px-4 py-2 text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
              >
                ← Anterior
              </button>
              <button
                onClick={next}
                className="rounded-full border border-[var(--brand-primary)]/30 px-4 py-2 text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
              >
                Siguiente →
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <CompanyCard company={company} isLoggedIn linkToFicha />
          </div>
        </div>
        <p className="mt-8 text-center">
          <Link href="/companies" className="text-[var(--brand-primary)] font-medium hover:underline">
            Ver todas las empresas →
          </Link>
        </p>
      </div>
    </section>
  );
}
