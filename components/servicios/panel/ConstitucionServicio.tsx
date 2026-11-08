import Link from "next/link";
import { Check } from "lucide-react";
import type { AgentCardData } from "@/lib/agent-shared";
import {
  DILIGENZ_SL_FEE,
  SL_STEPS,
  SL_THIRD_PARTY,
  servicioExpediente,
} from "@/lib/servicios-panel";
import ServiciosAgentMini from "./ServiciosAgentMini";
import CarpetaDocumentos from "./CarpetaDocumentos";

const CURRENT_STEP = 0;

const COMPANY_FIELDS = [
  ["Denominación social asignada", "Pendiente"],
  ["Socios y participación", "Pendiente"],
  ["Capital social", "Pendiente"],
  ["Domicilio social", "Pendiente"],
  ["Régimen de administración", "Pendiente"],
];

export default function ConstitucionServicio({
  requestId,
  agent,
  driveUrl,
  showBack = true,
}: {
  requestId: string;
  agent: AgentCardData | null;
  driveUrl: string | null;
  showBack?: boolean;
}) {
  const mail = agent?.email ? `mailto:${agent.email}` : "/contact";
  const tasks = [
    {
      title: "Sube tu DNI o NIE (ambas caras)",
      hint: "Para la tramitación de tu firma digital",
      action: "Subir",
      href: "/dashboard/profile",
    },
    {
      title: "5 nombres propuestos para la sociedad",
      hint: "Los revisamos en el Registro Mercantil Central",
      action: "Enviar",
      href: mail,
    },
    {
      title: "Complete el formulario de constitución",
      hint: "Reparto de participaciones y documentación de los socios",
      action: "Completar",
      href: mail,
    },
    {
      title: "¿El administrador tiene ya firma digital FNMT?",
      hint: "Si no la tiene, la tramitamos nosotros",
      action: "Responder",
      href: mail,
    },
    {
      title: "Oficina bancaria de tu preferencia",
      hint: "Coordinamos la cita para abrir la cuenta de la sociedad",
      action: "Indicar oficina",
      href: mail,
    },
    {
      title: "Certificado bancario del depósito del capital social",
      hint: "Una vez realizado el ingreso en la cuenta de la sociedad",
      action: "Subir",
      href: driveUrl || mail,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/dashboard/servicios/constitucion" className="font-semibold text-[var(--brand-primary)]">
          Mi servicio
        </Link>
        <Link href="/dashboard/servicios/documentos" className="text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]">
          Documentos
        </Link>
        <Link href="/dashboard/servicios/facturacion" className="text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]">
          Facturación
        </Link>
      </div>

      {showBack ? (
        <Link href="/dashboard/servicios" className="inline-flex text-sm text-[var(--foreground)]/60 hover:text-[var(--brand-dark)]">
          ← Volver a mi panel
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
            Servicio contratado
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
            Constitución de sociedad limitada
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            Expediente {servicioExpediente(requestId)} · Procedimiento CIRCE / PAE
          </p>
        </div>
        <span className="rounded-full bg-[#f8efc8] px-3 py-1 text-xs font-semibold text-[#8a6a12]">
          En trámite
        </span>
      </div>

      <ol className="grid grid-cols-2 gap-3 rounded-3xl border border-[#ece6f5] bg-white p-4 sm:grid-cols-5 xl:grid-cols-10">
        {SL_STEPS.map((label, index) => {
          const done = index < CURRENT_STEP;
          const current = index === CURRENT_STEP;
          return (
            <li key={label} className="min-w-0 text-center">
              <span
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-[#7c4dff] text-white"
                    : current
                      ? "bg-[#7c4dff] text-white ring-4 ring-[#efe7ff]"
                      : "bg-[#f3f0f7] text-[var(--foreground)]/45"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
              </span>
              <span className={`mt-2 block text-[10px] leading-tight ${current ? "font-semibold text-[var(--brand-dark)]" : "text-[var(--foreground)]/50"}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="-mt-2 text-sm text-[var(--foreground)]/60">
        Paso {CURRENT_STEP + 1} de {SL_STEPS.length} · {SL_STEPS[CURRENT_STEP]}
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        <section className="rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--brand-dark)]">Datos de la sociedad</h2>
          </div>
          <p className="mt-2 inline-flex rounded-full bg-[#f6f3fb] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]/55">
            Pendiente de completar el formulario
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {COMPANY_FIELDS.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]/40">{value}</dd>
              </div>
            ))}
          </dl>
          <a href={mail} className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-primary)] hover:underline">
            Editar datos →
          </a>
        </section>

        <div className="space-y-4">
          <section className="rounded-3xl border border-[#ece6f5] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">
              Honorarios Diligenz
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]/65">Tramitación completa, de principio a fin</p>
            <p className="mt-2 text-right text-2xl font-extrabold text-[var(--brand-primary)]">{DILIGENZ_SL_FEE}</p>
          </section>
          <section className="rounded-3xl border border-[#ece6f5] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">
              Gastos de gestión y terceros
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {SL_THIRD_PARTY.map((row) => (
                <li key={row.label} className="flex items-start justify-between gap-3">
                  <span className="text-[var(--foreground)]/70">{row.label}</span>
                  <span className="shrink-0 font-semibold text-[var(--brand-dark)]">{row.value}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3">
                <span className="text-[var(--foreground)]/70">Tramitación firma digital</span>
                <span className="rounded-full bg-[#f3f0f7] px-2.5 py-1 text-xs text-[var(--foreground)]/55">Por confirmar</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-[var(--foreground)]/70">Titularidad real (Iure)</span>
                <span className="rounded-full bg-[#f3f0f7] px-2.5 py-1 text-xs text-[var(--foreground)]/55">Por confirmar</span>
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-[var(--foreground)]/50">
              Importes orientativos sujetos a confirmación. La copia notarial se entrega con Código Seguro de Verificación (CSV).
            </p>
          </section>
          <ServiciosAgentMini agent={agent} eyebrow="Tu gestor" />
        </div>
      </div>

      <section className="rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[var(--brand-dark)]">Qué necesitamos de ti ahora</h2>
        <ul className="mt-4 divide-y divide-[#f3eef8]">
          {tasks.map((task) => (
            <li key={task.title} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-[#ddd4ea]" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-dark)]">{task.title}</p>
                  <p className="text-xs text-[var(--foreground)]/55">{task.hint}</p>
                </div>
              </div>
              <a
                href={task.href}
                className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                {task.action}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <CarpetaDocumentos driveUrl={driveUrl} />
    </div>
  );
}
