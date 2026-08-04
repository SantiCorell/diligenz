"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

type Audience = "sell" | "buy";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  fee?: string;
  featured?: boolean;
  items: { text: string; off?: boolean }[];
  cta: string;
  href: string;
};

const SELL_PLANS: Plan[] = [
  {
    name: "Esencial",
    tagline: "Base profesional para salir al mercado.",
    price: "6.000 – 12.000 €",
    priceNote: "pago único",
    fee: "Sin success fee",
    items: [
      { text: "Valoración (3 métodos)" },
      { text: "Teaser + infomemo y data room" },
      { text: "Checklist pre-due diligence" },
      { text: "Búsqueda de comprador", off: true },
      { text: "Negociación y SPA", off: true },
    ],
    cta: "Empezar",
    href: "#calculadora",
  },
  {
    name: "Avanzado",
    tagline: "Mandato activo con compradores cualificados.",
    price: "8.000 – 15.000 €",
    priceNote: "retainer a cuenta",
    fee: "+ success fee 2,5–4% según tamaño",
    featured: true,
    items: [
      { text: "Todo lo del plan Esencial" },
      { text: "Difusión a compradores verificados" },
      { text: "Coordinación de due diligence" },
      { text: "Apoyo en negociación hasta LOI" },
      { text: "Dirección jurídica del SPA", off: true },
    ],
    cta: "Empezar",
    href: "#calculadora",
  },
  {
    name: "Pro",
    tagline: "Llave en mano hasta la firma.",
    price: "15.000 – 25.000 €",
    priceNote: "retainer + legal",
    fee: "+ success fee 3–4% según tamaño",
    items: [
      { text: "Todo lo del plan Avanzado" },
      { text: "Dirección jurídica completa (SPA, R&W)" },
      { text: "Planificación fiscal de la venta" },
      { text: "Cierre notarial con letrado colegiado" },
      { text: "Asesor dedicado hasta el cierre" },
    ],
    cta: "Hablar con un asesor",
    href: "#calculadora",
  },
];

const BUY_PLANS: Plan[] = [
  {
    name: "Esencial",
    tagline: "Evalúa un target antes de decidir.",
    price: "4.000 – 8.000 €",
    priceNote: "pago único",
    fee: "Sin success fee",
    items: [
      { text: "Valoración y contraste del infomemo" },
      { text: "Informe de red flags pre-LOI" },
      { text: "Due diligence completa", off: true },
      { text: "Negociación y SPA", off: true },
    ],
    cta: "Empezar",
    href: "#calculadora",
  },
  {
    name: "Avanzado",
    tagline: "DD y apoyo en negociación.",
    price: "25.000 – 60.000 €",
    priceNote: "según scoping",
    fee: "Fijo por fases con cap",
    featured: true,
    items: [
      { text: "Todo lo del plan Esencial" },
      { text: "Due diligence (preferente completa)" },
      { text: "Apoyo en LOI y SPA" },
      { text: "Dirección hasta closing", off: true },
    ],
    cta: "Empezar",
    href: "#calculadora",
  },
  {
    name: "Pro",
    tagline: "De la búsqueda al cierre.",
    price: "A medida",
    priceNote: "fijo por fases",
    fee: "+ success fee 1–2,5% al cierre",
    items: [
      { text: "Todo lo del plan Avanzado" },
      { text: "Dirección completa hasta closing" },
      { text: "Estructuración fiscal de la compra" },
      { text: "Asesor dedicado en toda la operación" },
    ],
    cta: "Hablar con un asesor",
    href: "#calculadora",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={`relative flex flex-col gap-4 rounded-[1.6rem] border bg-white p-7 transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(23,18,31,0.2)] ${
        plan.featured
          ? "border-[var(--brand-primary)] shadow-[0_24px_56px_-24px_rgba(145,70,255,0.35)]"
          : "border-[var(--brand-primary)]/10"
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--brand-primary)] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
          El más elegido
        </span>
      )}
      <div>
        <h3 className="text-xl font-extrabold tracking-tight text-[var(--brand-dark)]">
          {plan.name}
        </h3>
        <p className="mt-1.5 min-h-[2.5rem] text-sm text-[var(--foreground)]/70">
          {plan.tagline}
        </p>
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
          {plan.price}
        </p>
        <p className="text-sm font-medium text-[var(--foreground)]/55">{plan.priceNote}</p>
        {plan.fee && (
          <p className="mt-1 text-xs font-semibold text-[var(--brand-primary)]">{plan.fee}</p>
        )}
      </div>
      <ul className="flex flex-1 flex-col gap-2.5 text-sm">
        {plan.items.map((item) => (
          <li
            key={item.text}
            className={`flex items-start gap-2 ${
              item.off ? "text-[var(--foreground)]/35" : "text-[var(--foreground)]/85"
            }`}
          >
            {item.off ? (
              <span className="mt-0.5 shrink-0 text-[var(--foreground)]/30">—</span>
            ) : (
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </span>
            )}
            <span>{item.off ? item.text : item.text}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className={`mt-2 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
          plan.featured
            ? "bg-[var(--brand-primary)] text-white hover:opacity-95"
            : plan.name === "Pro"
              ? "bg-[var(--brand-dark)] text-white hover:opacity-95"
              : "border border-[var(--brand-primary)]/25 text-[var(--brand-dark)] hover:border-[var(--brand-dark)]"
        }`}
      >
        {plan.cta}
      </Link>
    </article>
  );
}

export default function PlansToggle() {
  const [audience, setAudience] = useState<Audience>("sell");
  const plans = audience === "sell" ? SELL_PLANS : BUY_PLANS;

  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div className="inline-flex gap-1 rounded-full bg-[var(--brand-surface)] p-1.5">
          {(
            [
              { id: "sell" as const, label: "Para vendedores" },
              { id: "buy" as const, label: "Para compradores" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAudience(tab.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                audience === tab.id
                  ? "bg-[var(--brand-dark)] text-white"
                  : "text-[var(--foreground)]/65 hover:text-[var(--brand-dark)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={`${audience}-${plan.name}`} plan={plan} />
        ))}
      </div>
    </div>
  );
}
