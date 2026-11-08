import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/session";
import { CLIENT_SERVICE_STATUS_LABELS, currentStepIndex, formatServicePrice } from "@/lib/client-services";
import AcceptProposalButton from "@/components/servicios/panel/AcceptProposalButton";

export default async function ClientServicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  const { id } = await params;
  const service = await prisma.clientService.findFirst({
    where: { id, userId: session.user.id },
    include: {
      steps: { orderBy: { position: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!service) notFound();

  const current = currentStepIndex(service.steps);
  const proposal = service.status === "PROPOSAL";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/dashboard/servicios" className="inline-flex text-sm text-[var(--foreground)]/60 hover:text-[var(--brand-dark)]">
        ← Volver a mi panel
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
            {CLIENT_SERVICE_STATUS_LABELS[service.status]}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[var(--brand-dark)]">{service.title}</h1>
          {service.summary ? <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/70">{service.summary}</p> : null}
        </div>
        <p className="text-2xl font-extrabold text-[var(--brand-primary)]">{formatServicePrice(service.priceEur)}</p>
      </div>

      {proposal ? (
        <section className="rounded-3xl border border-[#ece6f5] bg-white p-5">
          <p className="text-sm text-[var(--foreground)]/70">
            Esta es la propuesta de Diligenz. Al aceptarla, el servicio pasa a estar en marcha y podrá seguir cada paso.
          </p>
          <div className="mt-4">
            <AcceptProposalButton serviceId={service.id} />
          </div>
        </section>
      ) : null}

      <ol className="space-y-2">
        {service.steps.map((step, index) => {
          const done = step.done;
          const active = !proposal && service.status === "IN_PROGRESS" && index === current && !done;
          return (
            <li key={step.id} className="flex items-start gap-3 rounded-2xl border border-[#ece6f5] bg-white px-4 py-3">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-[#7c4dff] text-white" : active ? "bg-[#7c4dff] text-white ring-4 ring-[#efe7ff]" : "bg-[#f3f0f7] text-[var(--foreground)]/45"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--brand-dark)]">{step.title}</p>
                {step.detail ? <p className="text-xs text-[var(--foreground)]/55">{step.detail}</p> : null}
                {active ? <p className="text-xs font-semibold text-[var(--brand-primary)]">Paso en curso</p> : null}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="rounded-3xl border border-[#ece6f5] bg-white p-5">
        <h2 className="text-lg font-bold text-[var(--brand-dark)]">Documentación</h2>
        {service.documents.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--foreground)]/60">Todavía no hay documentos en este servicio.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#f3eef8]">
            {service.documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-medium text-[var(--brand-dark)]">{document.name}</span>
                <a href={`/api/servicios/documents/${document.id}`} className="font-semibold text-[var(--brand-primary)]" target="_blank" rel="noopener noreferrer">
                  Ver
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
