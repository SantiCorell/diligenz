"use client";

import { FAQ_ITEMS } from "@/lib/seo";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Bloque de preguntas frecuentes en la home.
 * Diseño compacto; el contenido coincide con el JSON-LD FAQPage para rich snippets.
 */
export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="border-t border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-10 md:py-12"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2
          id="faq-heading"
          className="text-lg sm:text-xl font-bold text-[var(--brand-primary)] text-center mb-5"
        >
          Preguntas frecuentes
        </h2>

        <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white shadow-sm overflow-hidden">
          <ul className="divide-y divide-[var(--brand-primary)]/10">
            {FAQ_ITEMS.map((item, index) => (
              <li
                key={index}
                className="transition-colors hover:bg-[var(--brand-bg)]/50"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 font-medium text-[var(--brand-primary)] text-sm"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  itemProp="name"
                >
                  <span className="pr-2">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-[var(--brand-primary)] transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  hidden={openIndex !== index}
                  className="px-4 pb-3 md:px-5 md:pb-4 pt-0"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p
                    className="text-[var(--foreground)] text-sm opacity-90 leading-relaxed pl-0"
                    itemProp="text"
                  >
                    {item.answer}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
