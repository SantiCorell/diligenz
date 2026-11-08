"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-client";
import {
  CLIENT_SERVICE_STATUS_LABELS,
  SERVICE_TEMPLATES,
  formatServicePrice,
  type ServiceTemplate,
} from "@/lib/client-services";
import { toIntakeSnapshot, type IntakeFileView } from "@/lib/service-intake";
import { isConstitucionRequest } from "@/lib/servicios-panel";
import ConstitucionDatos from "@/components/servicios/panel/ConstitucionDatos";
import AdminStatusChip from "@/components/admin/AdminStatusChip";

type IntakeRow = {
  clientServiceId: string | null;
  contactRequestId: string | null;
  companyName: string | null;
  shareholders: string | null;
  shareCapital: string | null;
  registeredOffice: string | null;
  managementRegime: string | null;
  proposedNames: string | null;
  constitutionDetails: string | null;
  digitalSignature: string | null;
  bankOffice: string | null;
  files: IntakeFileView[];
};

type RequestRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  createdAt: string;
  userId: string | null;
  user: { id: string; name: string | null; email: string } | null;
  serviceIntake: IntakeRow | null;
};

type ServiceRow = {
  id: string;
  title: string;
  summary: string | null;
  priceEur: number;
  status: "PROPOSAL" | "IN_PROGRESS" | "COMPLETED" | "DISCARDED";
  createdAt: string;
  contactRequestId: string | null;
  user: { id: string; name: string | null; email: string };
};

type DraftStep = { title: string; detail: string };
type ServiceView = "all" | "solicitudes" | ServiceRow["status"];

const VIEWS: { id: ServiceView; label: string; description: string }[] = [
  { id: "all", label: "Todos", description: "Servicios ya creados" },
  { id: "solicitudes", label: "Solicitudes", description: "Aún sin propuesta" },
  { id: "PROPOSAL", label: "Propuestas", description: "Pendientes de aceptar" },
  { id: "IN_PROGRESS", label: "En marcha", description: "El cliente ya aceptó" },
  { id: "COMPLETED", label: "Finalizadas", description: "Operación cerrada" },
  { id: "DISCARDED", label: "Descartadas", description: "Se pueden reabrir" },
];

const STATUS_TONE = {
  PROPOSAL: "primary",
  IN_PROGRESS: "featured",
  COMPLETED: "success",
  DISCARDED: "neutral",
} as const;

function blankDraft(): { userId: string; userLabel: string; contactRequestId: string | null; title: string; summary: string; priceEur: string; steps: DraftStep[] } {
  return { userId: "", userLabel: "", contactRequestId: null, title: "", summary: "", priceEur: "", steps: [{ title: "", detail: "" }] };
}

export default function AdminServiciosPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(blankDraft);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ServiceView>("all");
  const [matches, setMatches] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await authFetch("/api/admin/servicios");
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setRequests(data.requests ?? []);
      setServices(data.services ?? []);
      setError(null);
    } else {
      setError(data.error || "No se ha podido cargar.");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || draft.userId) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await authFetch(`/api/admin/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMatches(data.users ?? []);
    }, 250);
    return () => clearTimeout(handle);
  }, [query, draft.userId]);

  const needle = search.trim().toLowerCase();
  const matchesText = (parts: Array<string | null | undefined>) =>
    !needle || parts.some((part) => (part || "").toLowerCase().includes(needle));

  const visibleRequests = useMemo(
    () => requests.filter((request) => matchesText([request.name, request.email, request.subject, request.user?.name, request.user?.email])),
    [requests, needle]
  );
  const visibleServices = useMemo(
    () =>
      services.filter((service) =>
        matchesText([service.title, service.user.name, service.user.email, service.summary])
      ),
    [services, needle]
  );

  const counts: Record<ServiceView, number> = {
    all: visibleServices.length,
    solicitudes: visibleRequests.length,
    PROPOSAL: visibleServices.filter((service) => service.status === "PROPOSAL").length,
    IN_PROGRESS: visibleServices.filter((service) => service.status === "IN_PROGRESS").length,
    COMPLETED: visibleServices.filter((service) => service.status === "COMPLETED").length,
    DISCARDED: visibleServices.filter((service) => service.status === "DISCARDED").length,
  };

  const listedServices =
    view === "all" || view === "solicitudes"
      ? view === "all"
        ? visibleServices
        : []
      : visibleServices.filter((service) => service.status === view);

  const applyTemplate = (template: ServiceTemplate) => {
    setDraft((current) => ({
      ...current,
      title: template.title,
      summary: template.summary,
      priceEur: template.priceEur ? String(template.priceEur) : "",
      steps: template.steps.map((step) => ({ title: step.title, detail: step.detail ?? "" })),
    }));
  };

  const openRequest = (request: RequestRow) => {
    setSelectedRequest(request);
    setCreating(true);
    const user = request.user;
    setDraft({
      ...blankDraft(),
      userId: user?.id ?? "",
      userLabel: user ? `${user.name || user.email}` : "",
      contactRequestId: request.id,
      title: request.subject?.trim() || "",
    });
    setQuery(user ? "" : request.email);
    if ((request.subject || request.message || "").toLowerCase().includes("constituci")) {
      const template = SERVICE_TEMPLATES[0];
      setDraft((current) => ({
        ...current,
        title: template.title,
        summary: template.summary,
        priceEur: String(template.priceEur),
        steps: template.steps.map((step) => ({ title: step.title, detail: "" })),
      }));
    }
  };

  const createProposal = async () => {
    setSaving(true);
    setError(null);
    const res = await authFetch("/api/admin/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: draft.userId,
        contactRequestId: draft.contactRequestId,
        title: draft.title,
        summary: draft.summary,
        priceEur: Number(draft.priceEur),
        steps: draft.steps.map((step) => ({ title: step.title, detail: step.detail })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se ha podido crear la propuesta.");
      return;
    }
    setCreating(false);
    setSelectedRequest(null);
    if (data.service?.id) {
      router.push(`/admin/servicios/${data.service.id}`);
      return;
    }
    await load();
  };

  return (
    <main className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 sm:text-sm">
            CRM
          </span>
          <h1 className="text-xl font-bold text-[var(--brand-primary)] sm:text-2xl">Servicios</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--foreground)] opacity-90 sm:text-base">
            Solicitudes y servicios de los clientes. Filtra por estado y entra en cada ficha para editar los datos, los pasos y los documentos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRequest(null);
            setDraft(blankDraft());
            setCreating(true);
          }}
          className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95"
        >
          Nueva propuesta
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {VIEWS.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-2 ring-[var(--brand-primary)]/20"
                  : "border-slate-200 bg-white hover:border-[var(--brand-primary)]/30 hover:bg-violet-50/30"
              }`}
            >
              <span className={`text-lg font-bold tabular-nums ${active ? "text-[var(--brand-dark)]" : "text-slate-700"}`}>
                {counts[item.id]}
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-500">{item.description}</p>
            </button>
          );
        })}
      </div>

      <div className="admin-filter-bar mb-8">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cliente, email o servicio…"
          className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
        />
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : (
        <div className="space-y-4">
          {view === "solicitudes"
            ? visibleRequests.length === 0
              ? <p className="admin-list-card rounded-2xl p-8 text-center text-sm text-[var(--foreground)] opacity-90">No hay solicitudes que coincidan.</p>
              : visibleRequests.map((request) => (
                  <div key={request.id} className="admin-list-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)]">{request.name}</p>
                      <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">{request.subject || "Solicitud de servicio"}</p>
                      <p className="mt-1 text-xs text-slate-500">{request.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <AdminStatusChip tone="warning">Solicitud</AdminStatusChip>
                      <button
                        type="button"
                        onClick={() => openRequest(request)}
                        className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95"
                      >
                        Crear propuesta
                      </button>
                    </div>
                  </div>
                ))
            : listedServices.length === 0
              ? <p className="admin-list-card rounded-2xl p-8 text-center text-sm text-[var(--foreground)] opacity-90">No hay servicios que coincidan con el filtro.</p>
              : listedServices.map((service) => (
                  <div key={service.id} className="admin-list-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)]">{service.user.name || service.user.email}</p>
                      <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">{service.title}</p>
                      <p className="mt-2 text-sm font-medium text-[var(--brand-primary)]">{formatServicePrice(service.priceEur)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <AdminStatusChip tone={STATUS_TONE[service.status]}>{CLIENT_SERVICE_STATUS_LABELS[service.status]}</AdminStatusChip>
                      <Link
                        href={`/admin/servicios/${service.id}`}
                        className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-95"
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                ))}
        </div>
      )}

      {creating ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/30"
            aria-label="Cerrar"
            onClick={() => {
              setCreating(false);
              setSelectedRequest(null);
            }}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--brand-dark)]">Nueva propuesta</h2>
              {selectedRequest ? (
                <p className="text-sm text-slate-600">
                  A partir de la solicitud de {selectedRequest.name}. {selectedRequest.message ? selectedRequest.message.slice(0, 180) : ""}
                </p>
              ) : null}
              {selectedRequest && isConstitucionRequest(selectedRequest.subject, selectedRequest.message) ? (
                <ConstitucionDatos
                  variant="admin"
                  userId={selectedRequest.user?.id ?? selectedRequest.userId}
                  initial={toIntakeSnapshot(selectedRequest.serviceIntake, { contactRequestId: selectedRequest.id })}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                {SERVICE_TEMPLATES.map((template) => (
                  <button key={template.id} type="button" onClick={() => applyTemplate(template)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold">
                    {template.label}
                  </button>
                ))}
              </div>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Cliente</span>
                {draft.userId ? (
                  <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2">{draft.userLabel}</p>
                ) : (
                  <>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o email" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    <ul className="mt-1">
                      {matches.map((user) => (
                        <li key={user.id}>
                          <button
                            type="button"
                            className="w-full px-2 py-1 text-left text-sm hover:bg-slate-50"
                            onClick={() => {
                              setDraft((current) => ({ ...current, userId: user.id, userLabel: user.name || user.email }));
                              setQuery("");
                            }}
                          >
                            {user.name || user.email} · {user.email}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Servicio</span>
                <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Qué incluye</span>
                <textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Precio sin IVA (€)</span>
                <input value={draft.priceEur} onChange={(event) => setDraft({ ...draft, priceEur: event.target.value.replace(/[^\d]/g, "") })} inputMode="numeric" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                <span className="mt-1 block text-xs text-slate-500">El cliente verá este importe más IVA.</span>
              </label>
              <div>
                <p className="text-sm font-medium text-slate-700">Pasos</p>
                <ol className="mt-2 space-y-2">
                  {draft.steps.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 w-5 text-xs font-bold text-slate-400">{index + 1}</span>
                      <input
                        value={step.title}
                        onChange={(event) => {
                          const steps = [...draft.steps];
                          steps[index] = { ...step, title: event.target.value };
                          setDraft({ ...draft, steps });
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder={`Paso ${index + 1}`}
                      />
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, steps: [...draft.steps, { title: "", detail: "" }] })}
                  className="mt-2 text-sm font-semibold text-[var(--brand-primary)]"
                >
                  Añadir paso
                </button>
              </div>
              <button type="button" disabled={saving} onClick={() => void createProposal()} className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? "Enviando…" : "Enviar propuesta"}
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </main>
  );
}
