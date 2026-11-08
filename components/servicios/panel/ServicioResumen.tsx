import Link from "next/link";
import { Check } from "lucide-react";
import type { AgentCardData } from "@/lib/agent-shared";
import { SL_THIRD_PARTY } from "@/lib/servicios-panel";
import type { IntakeSnapshot } from "@/lib/service-intake";
import AcceptProposalButton from "./AcceptProposalButton";
import CarpetaDocumentos from "./CarpetaDocumentos";
import ConstitucionDatos from "./ConstitucionDatos";
import ServiciosAgentMini from "./ServiciosAgentMini";

const COMPANY_FIELDS = [
  ["Denominación social asignada", "Pendiente"],
  ["Socios y participación", "Pendiente"],
  ["Capital social", "Pendiente"],
  ["Domicilio social", "Pendiente"],
  ["Régimen de administración", "Pendiente"],
];

export type ServicioStepView = { title: string; done: boolean };

export default function ServicioResumen({
  tabs,
  active,
  title,
  expediente,
  badge,
  steps,
  currentIndex,
  priceLabel,
  priceCaption,
  showSlDetails,
  agent,
  documentsUrl,
  invoicesUrl,
  acceptServiceId,
  showBack = true,
  intake = null,
}: {
  tabs: { servicio: string; documentos: string; facturacion: string };
  active: "servicio" | "documentos" | "facturacion";
  title: string;
  expediente: string;
  badge: string;
  steps: ServicioStepView[];
  currentIndex: number;
  priceLabel: string;
  priceCaption: string;
  showSlDetails: boolean;
  agent: AgentCardData | null;
  documentsUrl: string | null;
  invoicesUrl: string | null;
  acceptServiceId?: string | null;
  showBack?: boolean;
  intake?: IntakeSnapshot | null;
}) {
  const mail = agent?.email ? `mailto:${agent.email}` : "/contact";
  const current = steps[currentIndex] ?? steps[0];
  const tasks = [
    { title: "Sube tu DNI o NIE (ambas caras)", hint: "Para la tramitación de tu firma digital", action: "Subir", href: "/dashboard/profile" },
    { title: "5 nombres propuestos para la sociedad", hint: "Los revisamos en el Registro Mercantil Central", action: "Enviar", href: mail },
    { title: "Complete el formulario de constitución", hint: "Reparto de participaciones y documentación de los socios", action: "Completar", href: mail },
    { title: "¿El administrador tiene ya firma digital FNMT?", hint: "Si no la tiene, la tramitamos nosotros", action: "Responder", href: mail },
    { title: "Oficina bancaria de tu preferencia", hint: "Coordinamos la cita para abrir la cuenta de la sociedad", action: "Indicar oficina", href: mail },
    { title: "Certificado bancario del depósito del capital social", hint: "Una vez realizado el ingreso en la cuenta de la sociedad", action: "Subir", href: documentsUrl || mail },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Tab href={tabs.servicio} active={active === "servicio"}>Mi servicio</Tab>
        <Tab href={tabs.documentos} active={active === "documentos"}>Documentos</Tab>
        <Tab href={tabs.facturacion} active={active === "facturacion"}>Facturación</Tab>
      </div>

      {showBack ? (
        <Link href="/dashboard/servicios" className="inline-flex text-sm text-[var(--foreground)]/60 hover:text-[var(--brand-dark)]">
          ← Volver a mi panel
        </Link>
      ) : null}

      {active === "servicio" ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                Servicio contratado
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-[var(--foreground)]/60">Expediente {expediente}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {acceptServiceId ? <AcceptProposalButton serviceId={acceptServiceId} /> : null}
              <span className="rounded-full bg-[#f8efc8] px-3 py-1 text-xs font-semibold text-[#8a6a12]">{badge}</span>
            </div>
          </div>

          <ol className="grid grid-cols-2 gap-3 rounded-3xl border border-[#ece6f5] bg-white p-4 sm:grid-cols-5 xl:grid-cols-10">
            {steps.map((step, index) => {
              const done = step.done;
              const isCurrent = index === currentIndex && !done;
              return (
                <li key={`${step.title}-${index}`} className="min-w-0 text-center">
                  <span
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      done || isCurrent
                        ? "bg-[#7c4dff] text-white"
                        : "bg-[#f3f0f7] text-[var(--foreground)]/45"
                    } ${isCurrent ? "ring-4 ring-[#efe7ff]" : ""}`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                  </span>
                  <span className={`mt-2 block text-[10px] leading-tight ${isCurrent ? "font-semibold text-[var(--brand-dark)]" : "text-[var(--foreground)]/50"}`}>
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ol>
          {current ? (
            <p className="-mt-2 text-sm text-[var(--foreground)]/60">
              Paso {Math.min(currentIndex, steps.length - 1) + 1} de {steps.length} · {current.title}
            </p>
          ) : null}

          {showSlDetails && intake ? (
            <ConstitucionDatos initial={intake}>
              <Fees agent={agent} priceLabel={priceLabel} priceCaption={priceCaption} showSlDetails />
            </ConstitucionDatos>
          ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
            {showSlDetails ? (
              <section className="rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-[var(--brand-dark)]">Datos de la sociedad</h2>
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
            ) : (
              <section className="rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-[var(--brand-dark)]">El servicio</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/65">{priceCaption}</p>
              </section>
            )}

            <Fees agent={agent} priceLabel={priceLabel} priceCaption={priceCaption} showSlDetails={showSlDetails} />
          </div>
          )}

          {showSlDetails && !intake ? (
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
                    <a href={task.href} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                      {task.action}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <CarpetaDocumentos driveUrl={documentsUrl} />
        </>
      ) : null}

      {active === "documentos" ? (
        <>
          <h1 className="text-2xl font-extrabold text-[var(--brand-dark)]">Documentos</h1>
          <CarpetaDocumentos driveUrl={documentsUrl} />
        </>
      ) : null}

      {active === "facturacion" ? (
        <>
          <h1 className="text-2xl font-extrabold text-[var(--brand-dark)]">Facturación</h1>
          <section className="rounded-3xl border border-[#ece6f5] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">Honorarios Diligenz</p>
            <p className="mt-2 text-sm text-[var(--foreground)]/65">{title} · {priceCaption}</p>
            <p className="mt-3 text-3xl font-extrabold text-[var(--brand-primary)]">{priceLabel}</p>
          </section>
          {showSlDetails ? (
            <section className="rounded-3xl border border-[#ece6f5] bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">Gastos de gestión y terceros</p>
              <ul className="mt-3 space-y-2 text-sm">
                {SL_THIRD_PARTY.map((row) => (
                  <li key={row.label} className="flex justify-between gap-3">
                    <span className="text-[var(--foreground)]/70">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--foreground)]/50">
                Estos importes son de notaría, registro y otros organismos. No forman parte de los honorarios de Diligenz.
              </p>
            </section>
          ) : null}
          <CarpetaDocumentos driveUrl={invoicesUrl} title="Facturas" emptyText="Tu gestor publicará aquí el enlace a las facturas." />
        </>
      ) : null}
    </div>
  );
}

function Fees({
  agent,
  priceLabel,
  priceCaption,
  showSlDetails,
}: {
  agent: AgentCardData | null;
  priceLabel: string;
  priceCaption: string;
  showSlDetails: boolean;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[#ece6f5] bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">Honorarios Diligenz</p>
        <p className="mt-2 text-sm text-[var(--foreground)]/65">
          {showSlDetails ? "Tramitación completa, de principio a fin" : priceCaption}
        </p>
        <p className="mt-2 text-right text-2xl font-extrabold text-[var(--brand-primary)]">{priceLabel}</p>
      </section>
      {showSlDetails ? (
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
      ) : null}
      <ServiciosAgentMini agent={agent} eyebrow="Tu gestor" />
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link href={href} className={active ? "font-semibold text-[var(--brand-primary)]" : "text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]"}>
      {children}
    </Link>
  );
}
