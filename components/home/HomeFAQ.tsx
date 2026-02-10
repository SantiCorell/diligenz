"use client";

import { FAQ_ITEMS } from "@/lib/seo";
import { useState } from "react";

/**
 * Bloque de preguntas frecuentes en la home.
 * El contenido coincide con el JSON-LD FAQPage para reforzar rich snippets en Google España.
 */
export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="border-t border-[var(--brand-primary)]/10 bg-white/50 py-16 md:py-20"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2
          id="faq-heading"
          className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)] text-center mb-10"
        >
          Preguntas frecuentes sobre comprar y vender empresas en España
        </h2>
        <ul className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <li
              key={index}
              className="rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] overflow-hidden"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                itemProp="name"
              >
                <span>{item.question}</span>
                <span className="text-xl shrink-0" aria-hidden>
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                hidden={openIndex !== index}
                className="px-5 pb-4"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p className="text-[var(--foreground)] opacity-90 leading-relaxed" itemProp="text">
                  {item.answer}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
