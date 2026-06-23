"use client";

import { useRef } from "react";
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
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            Empresas destacadas
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)]/70 sm:text-base">
            Oportunidades reales, verificadas y confidenciales
          </p>
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {companies.map((company) => (
            <div
              key={company.id}
              className="w-[min(92vw,520px)] shrink-0 snap-center sm:w-[520px]"
            >
              <CompanyCard company={company} isLoggedIn compact />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/5"
            aria-label="Ver empresas anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/5"
            aria-label="Ver más empresas"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
