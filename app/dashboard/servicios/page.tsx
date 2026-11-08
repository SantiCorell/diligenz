import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, FileText, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/session";
import { getDisplayName } from "@/lib/user-display";
import { loadServiciosContext } from "@/lib/servicios-panel-data";
import { CLIENT_SERVICE_STATUS_LABELS, currentStepIndex, formatServicePrice } from "@/lib/client-services";
import { SL_STEPS, isConstitucionRequest, servicioExpediente } from "@/lib/servicios-panel";
import ServiciosAgentMini from "@/components/servicios/panel/ServiciosAgentMini";

export default async function MisServiciosPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const displayName = session.user.name?.trim() || getDisplayName(session.user.email);
  const [{ requests, constitucion, agent }, services] = await Promise.all([
    loadServiciosContext(session.user.id, session.user.email),
    prisma.clientService.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { steps: { orderBy: { position: "asc" } } },
    }),
  ]);
  const linkedRequests = new Set(services.map((service) => service.contactRequestId).filter(Boolean));
  const otros = requests.filter(
    (request) => !isConstitucionRequest(request.subject, request.message) && !linkedRequests.has(request.id)
  );
  const showConstitucion = Boolean(constitucion && !linkedRequests.has(constitucion.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-r from-[#c4b5fd] via-[#b197fc] to-[#9b7dff] px-6 py-8 text-white sm:px-8 sm:py-9">
        <Building2 className="pointer-events-none absolute -bottom-8 right-4 h-40 w-40 text-white/15" strokeWidth={1} aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Panel de bienvenida</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Hola, {displayName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          Este es el espacio donde encontrará todo lo relativo a los servicios que ha contratado con Diligenz y podrá hacer seguimiento de cada trámite.
        </p>
      </section>

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/45">Su servicio</p>
        {services.map((service) => {
          const current = currentStepIndex(service.steps);
          const label = service.status === "IN_PROGRESS" ? service.steps[current]?.title : CLIENT_SERVICE_STATUS_LABELS[service.status];
          return (
            <article key={service.id} className="mt-3 rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--brand-dark)]">{service.title}</h2>
                  <p className="mt-0.5 text-sm text-[var(--foreground)]/55">
                    {formatServicePrice(service.priceEur)} · {label}
                  </p>
                </div>
                <span className="rounded-full bg-[#f8efc8] px-3 py-1 text-xs font-semibold text-[#8a6a12]">
                  {CLIENT_SERVICE_STATUS_LABELS[service.status]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {service.steps.map((step, index) => (
                  <span
                    key={step.id}
                    title={step.title}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                      step.done || index === current
                        ? "bg-[#7c4dff] text-white"
                        : "bg-[#f3f0f7] text-[var(--foreground)]/40"
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
              <Link
                href={`/dashboard/servicios/${service.id}`}
                className="mt-4 inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                Ver mi servicio →
              </Link>
            </article>
          );
        })}
        {showConstitucion && constitucion ? (
          <article className="mt-3 rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4efff] text-[#7c4dff]">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[var(--brand-dark)]">Constitución de sociedad limitada</h2>
                  <p className="mt-0.5 text-sm text-[var(--foreground)]/55">
                    Expediente {servicioExpediente(constitucion.id)} · Procedimiento CIRCE / PAE
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#f8efc8] px-3 py-1 text-xs font-semibold text-[#8a6a12]">En trámite</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                {SL_STEPS.map((label, index) => (
                  <span
                    key={label}
                    title={label}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                      index === 0 ? "bg-[#7c4dff] text-white ring-4 ring-[#efe7ff]" : "bg-[#f3f0f7] text-[var(--foreground)]/40"
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
                <span className="ml-2 text-sm text-[var(--foreground)]/60">Paso 1 de 10 · {SL_STEPS[0]}</span>
              </div>
              <Link
                href="/dashboard/servicios/constitucion"
                className="inline-flex items-center rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                Ver mi servicio →
              </Link>
            </div>
          </article>
        ) : services.length === 0 ? (
          <article className="mt-3 rounded-3xl border border-[#ece6f5] bg-white px-6 py-8">
            <h2 className="text-lg font-bold text-[var(--brand-dark)]">Todavía no hay un servicio en marcha</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--foreground)]/65">
              Cuando solicite algún servicio, el expediente, los pasos y los documentos aparecerán aquí.
            </p>
            <Link
              href="/servicios"
              className="mt-4 inline-flex rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            >
              Solicita algún servicio
            </Link>
          </article>
        ) : null}
        {otros.length > 0 && (
          <ul className="mt-3 space-y-2">
            {otros.map((request) => (
              <li key={request.id} className="rounded-2xl border border-[#ece6f5] bg-white px-4 py-3 text-sm">
                <span className="font-semibold text-[var(--brand-dark)]">{request.subject?.trim() || "Solicitud de servicio"}</span>
                <span className="ml-2 text-[var(--foreground)]/50">{request.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/45">También puede interesarle</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_280px]">
          <article className="rounded-3xl border border-[#ece6f5] bg-white p-5">
            <Users className="h-5 w-5 text-[#7c4dff]" aria-hidden />
            <h3 className="mt-3 font-bold text-[var(--brand-dark)]">Pacto de socios</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]/65">
              Reglas claras entre socios desde el primer día: salidas, vesting, no competencia.
            </p>
            <Link href="/contact" className="mt-3 inline-flex text-sm font-semibold text-[var(--brand-primary)]">
              Más información →
            </Link>
          </article>
          <article className="rounded-3xl border border-[#ece6f5] bg-white p-5">
            <FileText className="h-5 w-5 text-[#7c4dff]" aria-hidden />
            <h3 className="mt-3 font-bold text-[var(--brand-dark)]">Asesoría por iguala</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]/65">
              Fiscal, laboral y contable recurrente para su nueva sociedad, con cuota mensual.
            </p>
            <Link href="/servicios" className="mt-3 inline-flex text-sm font-semibold text-[var(--brand-primary)]">
              Más información →
            </Link>
          </article>
          <ServiciosAgentMini agent={agent} />
        </div>
      </section>
    </div>
  );
}
