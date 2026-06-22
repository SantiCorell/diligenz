"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CompanyCard from "./CompanyCard";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

export default function FeaturedCompanies() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const companies = MOCK_COMPANIES.slice(0, 6);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="bg-[var(--brand-bg)] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            Empresas destacadas
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)]/70 sm:text-base">
            Oportunidades reales, verificadas y confidenciales
          </p>
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {companies.map((company) => (
            <div
              key={company.id}
              className="w-[min(100%,320px)] shrink-0 snap-center sm:w-[340px]"
            >
              <CompanyCard company={company} isLoggedIn compact />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-primary)]/20 bg-white text-[var(--brand-primary)] shadow-sm transition hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-surface)]"
            aria-label="Ver empresas anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-primary)]/20 bg-white text-[var(--brand-primary)] shadow-sm transition hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-surface)]"
            aria-label="Ver más empresas"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            Ver todas las empresas
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
