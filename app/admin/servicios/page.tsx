"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/auth-client";
import {
  CLIENT_SERVICE_STATUS_LABELS,
  SERVICE_TEMPLATES,
  formatServicePrice,
  type ServiceTemplate,
} from "@/lib/client-services";

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
};

type StepRow = { id: string; position: number; title: string; detail: string | null; done: boolean };
type DocRow = { id: string; name: string; size: number | null; createdAt: string };
type ServiceRow = {
  id: string;
  title: string;
  summary: string | null;
  priceEur: number;
  status: "PROPOSAL" | "IN_PROGRESS" | "COMPLETED" | "DISCARDED";
  createdAt: string;
  contactRequestId: string | null;
  user: { id: string; name: string | null; email: string };
  steps: StepRow[];
  documents: DocRow[];
};

type DraftStep = { title: string; detail: string };

const COLUMNS = [
  { id: "solicitudes", label: "Solicitudes", accent: "bg-amber-400" },
  { id: "PROPOSAL", label: "Propuestas", accent: "bg-violet-400" },
  { id: "IN_PROGRESS", label: "En marcha", accent: "bg-sky-500" },
  { id: "COMPLETED", label: "Finalizadas", accent: "bg-emerald-500" },
  { id: "DISCARDED", label: "Descartadas", accent: "bg-slate-400" },
] as const;

function blankDraft(): { userId: string; userLabel: string; contactRequestId: string | null; title: string; summary: string; priceEur: string; steps: DraftStep[] } {
  return { userId: "", userLabel: "", contactRequestId: null, title: "", summary: "", priceEur: "", steps: [{ title: "", detail: "" }] };
}

export default function AdminServiciosPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(blankDraft);
  const [query, setQuery] = useState("");
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

  const visibleRequests = useMemo(() => requests, [requests]);

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
    setSelectedService(null);
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
    setSelectedService(data.service);
    await load();
  };

  const patchService = async (id: string, body: unknown) => {
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/admin/servicios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se ha podido guardar.");
      return;
    }
    setSelectedService(data.service);
    await load();
  };

  const upload = async (id: string, file: File) => {
    const form = new FormData();
    form.set("file", file);
    setSaving(true);
    const res = await authFetch(`/api/admin/servicios/${id}/documents`, { method: "POST", body: form });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se ha podido subir el documento.");
      return;
    }
    await load();
    const fresh = await authFetch("/api/admin/servicios");
    const data = await fresh.json().catch(() => ({}));
    const next = (data.services as ServiceRow[] | undefined)?.find((service) => service.id === id) ?? null;
    setSelectedService(next);
  };

  return (
    <main className="mx-auto max-w-[90rem]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80">CRM</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--brand-dark)]">Servicios</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/75">
            Crea una propuesta con el servicio, los pasos, la documentación y el precio más IVA. El cliente la acepta y, a partir de ahí, sigue la operación.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedService(null);
            setSelectedRequest(null);
            setDraft(blankDraft());
            setCreating(true);
          }}
          className="rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Nueva propuesta
        </button>
      </div>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const cards =
              column.id === "solicitudes"
                ? visibleRequests
                : services.filter((service) => service.status === column.id);
            return (
              <section key={column.id} className="w-64 shrink-0">
                <div className={`mb-2 h-1 rounded-full ${column.accent}`} />
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">{column.label}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {column.id === "solicitudes"
                    ? visibleRequests.map((request) => (
                        <button
                          key={request.id}
                          type="button"
                          onClick={() => openRequest(request)}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-[var(--brand-primary)]/40"
                        >
                          <span className="block truncate text-sm font-semibold text-slate-900">{request.name}</span>
                          <span className="block truncate text-xs text-slate-500">{request.subject || "Solicitud de servicio"}</span>
                        </button>
                      ))
                    : services
                        .filter((service) => service.status === column.id)
                        .map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              setCreating(false);
                              setSelectedRequest(null);
                              setSelectedService(service);
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-[var(--brand-primary)]/40"
                          >
                            <span className="block truncate text-sm font-semibold text-slate-900">{service.user.name || service.user.email}</span>
                            <span className="block truncate text-xs text-slate-500">{service.title}</span>
                            <span className="mt-1 block text-xs font-semibold text-[var(--brand-primary)]">{formatServicePrice(service.priceEur)}</span>
                          </button>
                        ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {(creating || selectedService) && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/30"
            aria-label="Cerrar"
            onClick={() => {
              setCreating(false);
              setSelectedService(null);
              setSelectedRequest(null);
            }}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl">
            {creating ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[var(--brand-dark)]">Nueva propuesta</h2>
                {selectedRequest ? (
                  <p className="text-sm text-slate-600">
                    A partir de la solicitud de {selectedRequest.name}. {selectedRequest.message ? selectedRequest.message.slice(0, 180) : ""}
                  </p>
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
            ) : selectedService ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{CLIENT_SERVICE_STATUS_LABELS[selectedService.status]}</p>
                <h2 className="text-lg font-bold text-[var(--brand-dark)]">{selectedService.title}</h2>
                <p className="text-sm text-slate-600">{selectedService.user.name || selectedService.user.email} · {formatServicePrice(selectedService.priceEur)}</p>
                {selectedService.summary ? <p className="text-sm text-slate-600">{selectedService.summary}</p> : null}
                <ol className="space-y-2">
                  {selectedService.steps.map((step, index) => (
                    <li key={step.id}>
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={step.done}
                          disabled={selectedService.status !== "IN_PROGRESS" || saving}
                          onChange={(event) => {
                            const steps = selectedService.steps.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, done: event.target.checked } : item
                            );
                            void patchService(selectedService.id, {
                              steps: steps.map((item) => ({ title: item.title, detail: item.detail, done: item.done })),
                            });
                          }}
                        />
                        <span>
                          <span className="font-medium">{index + 1}. {step.title}</span>
                          {step.detail ? <span className="block text-xs text-slate-500">{step.detail}</span> : null}
                        </span>
                      </label>
                    </li>
                  ))}
                </ol>
                <div>
                  <p className="text-sm font-medium text-slate-700">Documentación</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {selectedService.documents.map((document) => (
                      <li key={document.id}>
                        <a className="text-[var(--brand-primary)]" href={`/api/servicios/documents/${document.id}`} target="_blank" rel="noopener noreferrer">{document.name}</a>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="file"
                    className="mt-2 block w-full text-sm"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void upload(selectedService.id, file);
                      event.target.value = "";
                    }}
                  />
                </div>
                {selectedService.status === "IN_PROGRESS" ? (
                  <button type="button" disabled={saving} onClick={() => void patchService(selectedService.id, { status: "COMPLETED" })} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
                    Marcar finalizada
                  </button>
                ) : null}
                {selectedService.status !== "DISCARDED" && selectedService.status !== "COMPLETED" ? (
                  <button type="button" disabled={saving} onClick={() => void patchService(selectedService.id, { status: "DISCARDED" })} className="ml-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                    Descartar
                  </button>
                ) : null}
              </div>
            ) : null}
          </aside>
        </>
      )}
    </main>
  );
}
