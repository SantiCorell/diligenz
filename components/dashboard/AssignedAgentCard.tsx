"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: { name?: string; email?: string };
      }) => void;
    };
  }
}
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Mail, MessageSquare, Phone } from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import {
  agentInitials,
  agentPhotoSrc,
  formatMeetingWhen,
  type AgentCardData,
  type MeetingPreview,
} from "@/lib/agent-shared";

type Props = {
  agent: AgentCardData | null;
  nextMeeting: MeetingPreview | null;
  userName: string;
  userEmail: string;
  /** `listing` es la tarjeta compacta de la ficha pública. */
  variant?: "dashboard" | "listing";
};

type SavedMeeting = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
};

function calendlyUrl(bookingUrl: string, name: string, email: string) {
  const url = new URL(bookingUrl);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("primary_color", "9146ff");
  if (name.trim()) url.searchParams.set("name", name.trim());
  if (email.trim()) url.searchParams.set("email", email.trim());
  return url.toString();
}

export default function AssignedAgentCard({
  agent,
  nextMeeting,
  userName,
  userEmail,
  variant = "dashboard",
}: Props) {
  const [open, setOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const photo = agent ? agentPhotoSrc(agent) : null;
  const canBook = Boolean(agent?.active && agent.bookingUrl);

  const scheduleModal =
    open && agent?.bookingUrl ? (
      <ScheduleMeetingModal
        bookingUrl={agent.bookingUrl}
        agentName={agent.name}
        userName={userName}
        userEmail={userEmail}
        onClose={() => setOpen(false)}
      />
    ) : null;

  if (variant === "listing") {
    if (!agent) return null;
    return (
      <>
        <article className="rounded-2xl border border-[#eadfff] bg-[#f7f2ff] p-5">
          <div className="flex items-center gap-3">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover object-[center_18%] ring-2 ring-white"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#5b34d6]">
                {agentInitials(agent.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c4dff]">
                ¿Dudas sobre esta operación?
              </p>
              <p className="truncate text-base font-bold text-slate-900">{agent.name}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#7c4dff]" aria-hidden />
              <a href={`mailto:${agent.email}`} className="truncate hover:underline">
                {agent.email}
              </a>
            </p>
            {agent.phone ? (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#7c4dff]" aria-hidden />
                <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="hover:underline">
                  {agent.phone}
                </a>
              </p>
            ) : null}
          </div>
          {canBook ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
            >
              <Calendar className="h-4 w-4" aria-hidden />
              Programar reunión
            </button>
          ) : null}
        </article>
        {scheduleModal}
      </>
    );
  }

  return (
    <>
      <article className="flex h-full flex-col rounded-2xl border border-[#e4d7ff] bg-[#f6f0ff] p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">Tu agente</p>
        {agent ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover object-[center_20%] ring-2 ring-white"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#5b34d6]">
                  {agentInitials(agent.name)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[var(--brand-dark)]">{agent.name}</h2>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#7c4dff]" aria-hidden />
                <a href={`mailto:${agent.email}`} className="truncate hover:underline">
                  {agent.email}
                </a>
              </p>
              {agent.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#7c4dff]" aria-hidden />
                  <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="hover:underline">
                    {agent.phone}
                  </a>
                </p>
              )}
            </div>
            {nextMeeting?.startsAt ? (
              <Link
                href="/dashboard/calendar"
                className="mt-3 text-xs font-semibold text-[#5b34d6] hover:underline"
              >
                Próxima reunión: {formatMeetingWhen(nextMeeting.startsAt)}
              </Link>
            ) : nextMeeting ? (
              <Link
                href="/dashboard/calendar"
                className="mt-3 text-xs font-semibold text-[#5b34d6] hover:underline"
              >
                Tienes una reserva pendiente de hora
              </Link>
            ) : null}
            <div className="mt-auto flex flex-col gap-2 pt-5">
              {canBook ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
                >
                  <Calendar className="h-4 w-4" aria-hidden />
                  Programar reunión
                </button>
              ) : (
                <p className="text-xs leading-relaxed text-slate-500">
                  Tu agente todavía no tiene agenda online.
                </p>
              )}
              <button
                type="button"
                onClick={() => setMessageOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4c2ff] bg-white px-4 py-2.5 text-sm font-semibold text-[#5b34d6] hover:bg-[#f6f0ff]"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                Enviar mensaje
              </button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Todavía no tienes un agente asignado. El equipo de Diligenz te lo asignará en breve.
          </p>
        )}
      </article>
      {scheduleModal}
      {messageOpen && agent && (
        <MessageAgentModal agentName={agent.name} onClose={() => setMessageOpen(false)} />
      )}
    </>
  );
}

function MessageAgentModal({
  agentName,
  onClose,
}: {
  agentName: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await authFetch("/api/me/agent-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "No se ha podido enviar el mensaje.");
        setSending(false);
        return;
      }
      setSent(true);
      setSending(false);
    } catch {
      setError("No se ha podido enviar el mensaje.");
      setSending(false);
    }
  };

  const dialog = (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">Tu gestor</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Mensaje para {agentName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
        {sent ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {agentName} ha recibido tu mensaje por correo, con tu nombre y tu perfil.
          </p>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3">
            <label htmlFor="agent-message" className="block text-sm text-slate-600">
              Le llegará a su correo, junto con tu nombre, email, teléfono y tipo de perfil.
            </label>
            <textarea
              id="agent-message"
              required
              minLength={2}
              maxLength={2000}
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escribe tu mensaje…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-[#7c4dff] focus:outline-none focus:ring-2 focus:ring-[#7c4dff]/20"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={sending || message.trim().length < 2}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              {sending ? "Enviando…" : "Enviar mensaje"}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}

function ScheduleMeetingModal({
  bookingUrl,
  agentName,
  userName,
  userEmail,
  onClose,
}: {
  bookingUrl: string;
  agentName: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const handledRef = useRef(false);
  const [meeting, setMeeting] = useState<SavedMeeting | null>(null);
  const [needsTime, setNeedsTime] = useState(false);
  const [when, setWhen] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;
    let cancelled = false;

    const init = () => {
      if (cancelled || !containerRef.current || !window.Calendly) return;
      containerRef.current.innerHTML = "";
      window.Calendly.initInlineWidget({
        url: calendlyUrl(bookingUrl, userName, userEmail),
        parentElement: containerRef.current,
        prefill: {
          name: userName.trim() || undefined,
          email: userEmail.trim() || undefined,
        },
      });
    };

    if (window.Calendly) init();
    else {
      const existing = document.getElementById("calendly-widget-script");
      if (existing) {
        existing.addEventListener("load", init, { once: true });
      } else {
        const script = document.createElement("script");
        script.id = "calendly-widget-script";
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        script.onload = init;
        document.body.appendChild(script);
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com") return;
      const data = event.data as { event?: string; payload?: { height?: string | number } };
      if (data?.event === "calendly.page_height" && containerRef.current) {
        const height = Number.parseInt(String(data.payload?.height ?? ""), 10);
        if (Number.isFinite(height)) {
          containerRef.current.style.height = `${Math.min(Math.max(height, 640), 900)}px`;
        }
      }
      if (data?.event !== "calendly.event_scheduled" || handledRef.current) return;
      handledRef.current = true;
      void (async () => {
        setError(null);
        setSaving(true);
        try {
          const res = await authFetch("/api/me/meetings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload: data.payload ?? event.data }),
          });
          const json = (await res.json().catch(() => ({}))) as {
            error?: string;
            needsTime?: boolean;
            meeting?: SavedMeeting;
          };
          if (!res.ok || !json.meeting) {
            handledRef.current = false;
            setError(json.error || "No se pudo guardar la reunión.");
            setSaving(false);
            return;
          }
          setMeeting(json.meeting);
          setNeedsTime(Boolean(json.needsTime));
          setSaving(false);
          router.refresh();
        } catch {
          handledRef.current = false;
          setError("No se pudo guardar la reunión.");
          setSaving(false);
        }
      })();
    };

    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
      if (parent) parent.innerHTML = "";
    };
  }, [bookingUrl, router, userEmail, userName]);

  const confirmTime = async () => {
    if (!meeting || !when) return;
    setSaving(true);
    setError(null);
    try {
      const startsAt = new Date(when);
      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
      const res = await authFetch(`/api/me/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; meeting?: SavedMeeting };
      if (!res.ok || !json.meeting) {
        setError(json.error || "No se pudo guardar la hora.");
        setSaving(false);
        return;
      }
      setMeeting(json.meeting);
      setNeedsTime(false);
      setSaving(false);
      router.refresh();
    } catch {
      setError("No se pudo guardar la hora.");
      setSaving(false);
    }
  };

  const dialog = (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar" onClick={onClose} />
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">Agenda</p>
            <h2 className="text-lg font-bold text-slate-900">Reunión con {agentName}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Elige un hueco. La invitación también llega a tu correo para añadirla a tu calendario.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {meeting ? (
            <div className="space-y-4 px-5 py-6">
              <p className="text-base font-semibold text-slate-900">Reserva registrada</p>
              {needsTime ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Indica la hora que acabas de reservar para verla en tu calendario de Diligenz.
                  </p>
                  <input
                    type="datetime-local"
                    value={when}
                    onChange={(event) => setWhen(event.target.value)}
                    className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={!when || saving}
                    onClick={() => void confirmTime()}
                    className="rounded-xl bg-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Guardando…" : "Guardar en mi calendario"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    {meeting.startsAt
                      ? `${meeting.title} · ${formatMeetingWhen(meeting.startsAt)}`
                      : meeting.title}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/dashboard/calendar"
                      className="rounded-xl bg-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white"
                      onClick={onClose}
                    >
                      Ver mi calendario
                    </Link>
                    {meeting.startsAt && (
                      <a
                        href={`/api/me/meetings/${meeting.id}/ics`}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                      >
                        Añadir a mi calendario
                      </a>
                    )}
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : (
            <>
              <div ref={containerRef} className="h-[700px] min-w-[320px] w-full" />
              {(saving || error) && (
                <p className={`px-5 pb-4 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
                  {error || "Guardando la reunión en tu calendario…"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
