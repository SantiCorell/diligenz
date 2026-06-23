"use client";

import { FAQ_ITEMS } from "@/lib/seo";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="relative py-14 md:py-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-14">
        <div>
          <h2
            id="faq-heading"
            className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl md:sticky md:top-28"
          >
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)]/65 sm:text-base">
            Resolvemos las dudas más habituales sobre compraventa, confidencialidad y uso de la
            plataforma.
          </p>
        </div>

        <ul className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li
                key={index}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? "border-[var(--brand-primary)]/20 bg-white/55 shadow-[0_8px_32px_rgba(145,70,255,0.08)] backdrop-blur-md"
                    : "border-white/50 bg-white/35 backdrop-blur-sm hover:bg-white/45"
                }`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-[var(--brand-dark)] sm:text-base"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  itemProp="name"
                >
                  <span className="pr-2">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--brand-primary)] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  hidden={!isOpen}
                  className="px-5 pb-4"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p
                    className="text-sm leading-relaxed text-[var(--foreground)]/75"
                    itemProp="text"
                  >
                    {item.answer}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
