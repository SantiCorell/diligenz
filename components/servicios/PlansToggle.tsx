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
  tone: "outline" | "solid" | "dark";
  items: { text: string; off?: boolean }[];
  cta: string;
  href: string;
};

const SELL_PLANS: Plan[] = [
  {
    name: "Esencial",
    tagline: "Puesta a punto de la compañía para su salida al mercado.",
    price: "6.000 – 12.000 €",
    priceNote: "Honorarios fijos",
    fee: "Sin honorarios de éxito",
    tone: "outline",
    items: [
      {
        text: "Valoración por tres metodologías: descuento de flujos, múltiplos comparables y valor patrimonial",
      },
      {
        text: "Teaser, cuaderno de venta (Information Memorandum) y sala de datos virtual",
      },
      {
        text: "Revisión preliminar de contingencias (vendor due diligence)",
      },
      { text: "Búsqueda activa de inversores (no incluida)", off: true },
    ],
    cta: "Solicitar propuesta",
    href: "#calculadora",
  },
  {
    name: "Avanzado",
    tagline: "Comercialización activa entre inversores cualificados.",
    price: "8.000 – 15.000 €",
    priceNote: "Retainer inicial",
    fee: "+ honorarios de éxito del 2,5 % al 4 %",
    featured: true,
    tone: "solid",
    items: [
      { text: "Todos los servicios del plan Esencial" },
      {
        text: "Presentación confidencial a inversores previamente cualificados, previa firma de NDA",
      },
      { text: "Coordinación del proceso de due diligence" },
      {
        text: "Asistencia en la negociación hasta la oferta no vinculante o carta de intenciones (LOI)",
      },
    ],
    cta: "Solicitar propuesta",
    href: "#calculadora",
  },
  {
    name: "Pro",
    tagline: "Dirección de la operación hasta su cierre.",
    price: "15.000 – 25.000 €",
    priceNote: "Retainer inicial",
    fee: "+ honorarios de éxito del 3 % al 4 %",
    tone: "dark",
    items: [
      { text: "Todos los servicios del plan Avanzado" },
      {
        text: "Dirección letrada del contrato de compraventa (SPA), manifestaciones y garantías (R&W) y régimen de indemnidad",
      },
      {
        text: "Coordinación integral con la notaría: preparación y revisión de la escritura y organización de la firma",
      },
      { text: "Interlocutor senior único durante toda la operación" },
    ],
    cta: "Concertar una reunión",
    href: "/contact",
  },
];

const BUY_PLANS: Plan[] = [
  {
    name: "Esencial",
    tagline: "Evalúe un target antes de decidir.",
    price: "4.000 – 8.000 €",
    priceNote: "Honorarios fijos",
    fee: "Sin honorarios de éxito",
    tone: "outline",
    items: [
      { text: "Valoración y contraste del cuaderno de venta" },
      { text: "Informe de contingencias previo a la LOI" },
      { text: "Due diligence completa", off: true },
      { text: "Negociación y SPA", off: true },
    ],
    cta: "Solicitar propuesta",
    href: "#calculadora",
  },
  {
    name: "Avanzado",
    tagline: "Due diligence y apoyo en la negociación.",
    price: "25.000 – 60.000 €",
    priceNote: "Según alcance",
    fee: "Honorarios fijos por fases, con límite",
    featured: true,
    tone: "solid",
    items: [
      { text: "Todos los servicios del plan Esencial" },
      { text: "Due diligence (preferente completa)" },
      { text: "Apoyo en la LOI y en el SPA" },
      { text: "Dirección hasta el cierre", off: true },
    ],
    cta: "Solicitar propuesta",
    href: "#calculadora",
  },
  {
    name: "Pro",
    tagline: "De la búsqueda al cierre.",
    price: "A medida",
    priceNote: "Honorarios fijos por fases",
    fee: "+ honorarios de éxito del 1 % al 2,5 % al cierre",
    tone: "dark",
    items: [
      { text: "Todos los servicios del plan Avanzado" },
      { text: "Dirección completa hasta el cierre" },
      { text: "Estructuración fiscal de la compra" },
      { text: "Interlocutor senior durante toda la operación" },
    ],
    cta: "Concertar una reunión",
    href: "/contact",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={`relative flex flex-col rounded-[1.6rem] border bg-white p-7 ${
        plan.featured
          ? "border-[var(--brand-primary)] shadow-[0_18px_40px_-28px_rgba(145,70,255,0.55)]"
          : "border-[var(--brand-primary)]/10"
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--brand-primary)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
          Recomendado
        </span>
      )}
      <h3 className="text-xl font-extrabold tracking-tight text-[var(--brand-dark)]">
        {plan.name}
      </h3>
      <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-[var(--foreground)]/65">
        {plan.tagline}
      </p>
      <p className="mt-5 text-[1.65rem] font-extrabold tracking-tight text-[var(--brand-dark)]">
        {plan.price}
      </p>
      <p className="mt-1 text-sm text-[var(--foreground)]/55">{plan.priceNote}</p>
      {plan.fee && (
        <p className="mt-1 text-sm font-semibold text-[var(--brand-primary)]">{plan.fee}</p>
      )}
      <ul className="mt-5 flex flex-1 flex-col gap-3 text-sm">
        {plan.items.map((item) => (
          <li
            key={item.text}
            className={`flex items-start gap-2.5 ${
              item.off ? "text-[var(--foreground)]/40" : "text-[var(--foreground)]/80"
            }`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                item.off ? "bg-[var(--foreground)]/15" : "bg-[var(--brand-primary)]"
              }`}
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
          plan.tone === "solid"
            ? "bg-[var(--brand-primary)] text-white hover:opacity-95"
            : plan.tone === "dark"
              ? "bg-[var(--brand-dark)] text-white hover:opacity-95"
              : "border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
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
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full bg-[#ece8f2] p-1">
          {(
            [
              { id: "sell" as const, label: "Vendedores" },
              { id: "buy" as const, label: "Inversores" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAudience(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                audience === tab.id
                  ? "bg-[var(--brand-dark)] text-white"
                  : "text-[var(--foreground)]/70 hover:text-[var(--brand-dark)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-stretch gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={`${audience}-${plan.name}`} plan={plan} />
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-[var(--foreground)]/55">
        Honorarios sin IVA. Las condiciones definitivas se recogen en la
        correspondiente hoja de encargo.
      </p>
    </div>
  );
}
