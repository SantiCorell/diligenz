import { Calendar, Mail, Phone } from "lucide-react";
import { agentInitials, agentPhotoSrc, type AgentCardData } from "@/lib/agent-shared";

export default function ServiciosAgentMini({
  agent,
  eyebrow = "Tu agente",
}: {
  agent: AgentCardData | null;
  eyebrow?: string;
}) {
  if (!agent) return null;
  const photo = agentPhotoSrc(agent);

  return (
    <aside className="rounded-3xl bg-[#f4efff] p-5">
      <div className="flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-11 w-11 rounded-full object-cover object-[center_18%] ring-2 ring-white" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-[#7c4dff]">
            {agentInitials(agent.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b6cf0]">{eyebrow}</p>
          <p className="truncate text-base font-bold text-[var(--brand-dark)]">{agent.name}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-sm text-[var(--foreground)]/75">
        <p className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 shrink-0 text-[#8b6cf0]" aria-hidden />
          <a href={`mailto:${agent.email}`} className="truncate hover:underline">{agent.email}</a>
        </p>
        {agent.phone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#8b6cf0]" aria-hidden />
            <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="hover:underline">{agent.phone}</a>
          </p>
        ) : null}
      </div>
      {agent.bookingUrl ? (
        <a
          href={agent.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          <Calendar className="h-4 w-4" aria-hidden />
          Programar reunión
        </a>
      ) : null}
    </aside>
  );
}
