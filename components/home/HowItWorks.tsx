"use client";

import { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  FileSignature,
  Search,
  Heart,
  FileText,
  Handshake,
  TrendingUp,
  Users,
  Eye,
  Briefcase,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Role = "comprador" | "vendedor" | "especialista";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
  sub?: string; // ej. "Firmados" para documentos
};

const FLOWS: Record<Role, { label: string; short: string; steps: Step[] }> = {
  comprador: {
    label: "Soy comprador",
    short: "Quiero comprar una empresa",
    steps: [
      {
        icon: UserPlus,
        title: "Me registro",
        description: "Creo mi cuenta en menos de 2 minutos",
      },
      {
        icon: FileSignature,
        title: "Documentos",
        description: "Pendientes de firma",
        sub: "Firmo → Firmados",
      },
      {
        icon: Search,
        title: "Exploro empresas",
        description: "Accedo a oportunidades verificadas",
      },
      {
        icon: Heart,
        title: "Me gusta una",
        description: "Solicito información confidencial",
      },
      {
        icon: FileText,
        title: "Analizo información",
        description: "Métricas financieras y documentos clave",
      },
      {
        icon: Handshake,
        title: "Conecto y cierro",
        description: "NDA, due diligence y cierre seguro",
      },
    ],
  },
  vendedor: {
    label: "Soy vendedor",
    short: "Quiero vender mi empresa",
    steps: [
      {
        icon: UserPlus,
        title: "Me registro",
        description: "Creo mi cuenta en menos de 2 minutos",
      },
      {
        icon: FileSignature,
        title: "Documentos",
        description: "Pendientes de firma",
        sub: "Firmo → Firmados",
      },
      {
        icon: TrendingUp,
        title: "Valoro y publico",
        description: "Valoro mi empresa y la publico en el marketplace",
      },
      {
        icon: Users,
        title: "Recibo interés",
        description: "Compradores verificados muestran interés",
      },
      {
        icon: FileText,
        title: "Comparto información",
        description: "Con interesados verificados, de forma segura",
      },
      {
        icon: Handshake,
        title: "Negocio y cierro",
        description: "Todo el proceso gestionado de forma segura",
      },
    ],
  },
  especialista: {
    label: "Asesor/Inversor",
    short: "Gestiono mandatos y operaciones M&A",
    steps: [
      {
        icon: UserPlus,
        title: "Me registro como profesional",
        description: "Cuenta para asesores y brokers",
      },
      {
        icon: FileSignature,
        title: "Perfil y acreditación",
        description: "Completo mi perfil y documentación",
      },
      {
        icon: Eye,
        title: "Gano visibilidad",
        description: "Aparezco en el marketplace para compradores y vendedores",
      },
      {
        icon: Users,
        title: "Me contactan",
        description: "Compradores o vendedores me localizan",
      },
      {
        icon: Briefcase,
        title: "Gestiono procesos",
        description: "Asesoro y gestiono operaciones de compraventa",
      },
      {
        icon: Sparkles,
        title: "Cierro operaciones",
        description: "Cierro deals y gano visibilidad y comisiones",
      },
    ],
  },
};

const STEP_DURATION_MS = 2500;

export default function HowItWorks() {
  const [role, setRole] = useState<Role>("comprador");
  const [activeStep, setActiveStep] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flow = FLOWS[role];
  const totalSteps = flow.steps.length;

  // Avance automático: un paso cada STEP_DURATION_MS; al cambiar de rol, reiniciar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset step when role changes
    setActiveStep(0);
  }, [role]);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % totalSteps);
    }, STEP_DURATION_MS);
    return () => clearInterval(t);
  }, [role, totalSteps]);

  // Solo desplazar el carrusel horizontal; scrollIntoView mueve también la página en móvil.
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(min-width: 1024px)").matches) return;
    const container = scrollContainerRef.current;
    const el = stepRefs.current[activeStep];
    if (!container || !el) return;
    const left = el.offsetLeft - (container.clientWidth - el.clientWidth) / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeStep, role]);

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
          ¿Cómo funciona?
        </h2>
        <p className="mt-3 text-center text-sm text-[var(--foreground)]/70 sm:text-base">
          Elige tu perfil y sigue el camino paso a paso
        </p>

        <div className="mt-8 flex justify-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3">
          {(Object.keys(FLOWS) as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`
                relative shrink-0 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-300
                ${role === r
                  ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20"
                  : "border border-[var(--brand-primary)]/15 bg-[var(--brand-surface)] text-[var(--brand-dark)] hover:border-[var(--brand-primary)]/30"
                }
              `}
            >
              {FLOWS[r].label}
            </button>
          ))}
        </div>

        {/* Descripción corta del rol */}
        <p className="mt-1 text-center text-xs sm:text-sm text-[var(--foreground)] opacity-80">
          {flow.short}
        </p>

        {/* Móvil: hint deslizar */}
        <p className="mt-6 text-center text-xs text-[var(--foreground)]/60 lg:hidden">
          Desliza para ver todos los pasos →
        </p>

        {/* Diagrama de pasos: scroll horizontal en móvil, grid en escritorio */}
        <div className="relative mt-4 lg:mt-10">
          {/* Línea conectora horizontal (solo desktop) */}
          <div className="absolute left-[8%] right-[8%] top-[3.25rem] hidden h-0.5 rounded-full bg-[var(--brand-primary)]/20 lg:block" style={{ zIndex: 0 }} />

          <div
          ref={scrollContainerRef}
          className="relative z-[2] -mx-4 flex items-stretch gap-3 overflow-x-auto overflow-y-visible scroll-px-4 px-4 pb-3 pt-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:scroll-px-0 lg:px-0 lg:pb-0 lg:pt-0"
        >
            {flow.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={`${role}-${i}`}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="flow-step-enter relative flex h-full w-[min(82vw,272px)] shrink-0 snap-center flex-col lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Card */}
                  <div
                    className={`
                      relative flex h-full min-h-[220px] w-full flex-col rounded-2xl bg-white/45 p-5 pt-8 text-center shadow-[0_8px_32px_rgba(145,70,255,0.06)] backdrop-blur-md
                      transition-all duration-300
                      ${i === activeStep
                        ? "ring-2 ring-[var(--brand-primary)]/30 shadow-md flow-card-current"
                        : ""
                      }
                    `}
                  >
                    <span
                      className={`absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold text-white ${
                        i === activeStep ? "bg-[var(--brand-primary)]" : "bg-[var(--brand-primary)]/70"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div
                      className={`mx-auto mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                        i === activeStep
                          ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]"
                          : "bg-white text-[var(--brand-primary)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="flex min-h-[2.75rem] shrink-0 items-center justify-center text-base font-semibold leading-snug text-[var(--brand-dark)]">
                      {step.title}
                    </h3>
                    <div className="mt-1.5 flex flex-1 flex-col">
                      <p className="text-sm text-[var(--foreground)] opacity-85">
                        {step.description}
                      </p>
                      <p
                        className={`mt-1 min-h-[1.25rem] text-xs font-medium text-[var(--brand-primary)]/90 ${step.sub ? "" : "invisible"}`}
                        aria-hidden={!step.sub}
                      >
                        {step.sub ?? "\u00A0"}
                      </p>
                    </div>
                  </div>

                  {/* Flecha: solo en desktop entre pasos */}
                  {i < flow.steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-[2.75rem] text-[var(--brand-primary)]/50">
                      <ChevronRight
                        className={`w-5 h-5 ${i === activeStep ? "flow-arrow-active-right text-[var(--brand-primary)]" : "opacity-40"}`}
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA suave */}
        <p className="mt-8 text-center text-sm text-[var(--foreground)] opacity-75">
          Proceso transparente, seguro y con soporte en cada paso.
        </p>
      </div>
    </section>
  );
}
