"use client";

import { useState, useEffect } from "react";
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
    label: "Ganar visibilidad",
    short: "Me dedico a vender empresas",
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

  return (
    <section className="bg-[var(--brand-bg)] py-12 md:py-16 border-t border-[var(--brand-primary)]/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-semibold text-center text-[var(--brand-primary)]">
          ¿Cómo funciona?
        </h2>
        <p className="mt-3 text-center text-lg text-[var(--foreground)] opacity-85">
          Elige tu perfil y sigue el camino paso a paso
        </p>

        {/* Tabs: 3 roles */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
          {(Object.keys(FLOWS) as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`
                relative rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300
                ${role === r
                  ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/25 scale-[1.02]"
                  : "bg-[var(--brand-bg-lavender)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20"
                }
              `}
            >
              {FLOWS[r].label}
            </button>
          ))}
        </div>

        {/* Descripción corta del rol */}
        <p className="mt-2 text-center text-[var(--foreground)] opacity-80">
          {flow.short}
        </p>

        {/* Diagrama de pasos: horizontal en desktop, vertical en móvil */}
        <div className="mt-10 relative">
          {/* Línea conectora horizontal (solo desktop), a la altura de los iconos */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[8%] right-[8%] h-0.5 bg-[var(--brand-primary)]/20 rounded-full" style={{ zIndex: 0 }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4 relative" style={{ zIndex: 2 }}>
            {flow.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={`${role}-${i}`}
                  className="flow-step-enter relative flex flex-col items-center"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Card: solo el paso actual se ilumina */}
                  <div
                    className={`
                      w-full rounded-2xl border-2 bg-[var(--brand-bg-lavender)] p-5 text-center
                      transition-all duration-300 hover:shadow-lg hover:border-[var(--brand-primary)]/30
                      ${i === activeStep
                        ? "border-[var(--brand-primary)] shadow-lg flow-card-current scale-[1.02]"
                        : "border-[var(--brand-primary)]/20 opacity-90"
                      }
                    `}
                  >
                    <div
                      className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        i === activeStep ? "bg-[var(--brand-primary)]/25 text-[var(--brand-primary)]" : "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]"
                      }`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--brand-primary)] opacity-90">
                      Paso {i + 1}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-[var(--brand-primary)]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[var(--foreground)] opacity-85">
                      {step.description}
                    </p>
                    {step.sub && (
                      <p className="mt-1 text-xs font-medium text-[var(--brand-primary)]/90">
                        {step.sub}
                      </p>
                    )}
                  </div>

                  {/* Flecha hacia el siguiente paso: solo la que sale del paso actual se anima (sentido del flujo) */}
                  {i < flow.steps.length - 1 && (
                    <>
                      <div className="hidden lg:flex absolute -right-3 top-[2.75rem] text-[var(--brand-primary)]/50">
                        <ChevronRight
                          className={`w-5 h-5 ${i === activeStep ? "flow-arrow-active-right text-[var(--brand-primary)]" : "opacity-40"}`}
                          aria-hidden
                        />
                      </div>
                      <div className="lg:hidden flex justify-center my-1 text-[var(--brand-primary)]/50">
                        <ChevronRight
                          className={`w-5 h-5 rotate-90 ${i === activeStep ? "flow-arrow-active-down text-[var(--brand-primary)]" : "opacity-40"}`}
                          aria-hidden
                        />
                      </div>
                    </>
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
