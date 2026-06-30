"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CompanyCard from "./CompanyCard";
import type { CompanyMock } from "@/lib/mock-companies";

type Props = {
  companies: CompanyMock[];
};

function chunkPairs(companies: CompanyMock[]): CompanyMock[][] {
  const pairs: CompanyMock[][] = [];
  for (let i = 0; i < companies.length; i += 2) {
    pairs.push(companies.slice(i, i + 2));
  }
  return pairs;
}

export default function FeaturedCompaniesCarousel({ companies }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const slides = useMemo(
    () => (isWide ? chunkPairs(companies) : companies.map((company) => [company])),
    [companies, isWide]
  );

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  if (companies.length === 0) return null;

  const showArrows = slides.length > 1;

  return (
    <div className="mt-10">
      <div className="overflow-x-hidden px-1 py-2">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.map((c) => c.id).join("-") || index}
              className="grid w-full min-w-full max-w-full shrink-0 grow-0 basis-full snap-start grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
            >
              {slide.map((company) => (
                <div key={company.id} className="min-w-0">
                  <CompanyCard company={company} compact />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] shadow-md transition hover:bg-[var(--brand-primary)]/5"
            aria-label="Ver empresas anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--brand-primary)] bg-white text-[var(--brand-primary)] shadow-md transition hover:bg-[var(--brand-primary)]/5"
            aria-label="Ver más empresas"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
