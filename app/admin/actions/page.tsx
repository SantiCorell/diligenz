"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import {
  PIPELINE_STATUSES,
  PIPELINE_STATUS_LABELS,
  ageLabel,
  buyerMomentCopy,
  type PipelineStatus,
} from "@/lib/info-request-pipeline";

type HistoryEvent = {
  id: string;
  type: string;
  metadata: unknown;
  createdAt: string;
};

type ActionRow = {
  id: string;
  userEmail: string;
  userName: string | null;
  userPhone: string | null;
  ndaSigned: boolean;
  dniVerified: boolean;
  companyId: string;
  companyName: string;
  companyReference: string | null;
  status: PipelineStatus;
  internalNote: string;
  createdAt: string;
  statusUpdatedAt: string;
  history: HistoryEvent[];
};

const COLUMN_ACCENT: Record<PipelineStatus, string> = {
  PENDING_NDA: "bg-amber-400",
  IN_REVIEW: "bg-orange-400",
  TEASER: "bg-lime-500",
  CONVERSATIONS: "bg-sky-500",
  CLOSED: "bg-slate-400",
  REJECTED: "bg-rose-400",
};

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function formatCreatedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function eventLabel(event: HistoryEvent): string {
  const meta = (event.metadata ?? {}) as { to?: string; from?: string; automatic?: boolean };
  if (event.type === "INFO_REQUEST_CREATED") return "Solicitud creada";
  if (meta.to) {
    const label = PIPELINE_STATUS_LABELS[meta.to as PipelineStatus] ?? meta.to;
    return meta.automatic ? `${label} · automático` : label;
  }
  return "Cambio de estado";
}

export default function AdminActionsPage() {
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [query, setQuery] = useState("");
  const [createdSort, setCreatedSort] = useState<"desc" | "asc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = async () => {
    setLoading(true);
    const res = await authFetch("/api/admin/actions");
    const data = await res.json();
    if (res.ok) setActions(data.actions ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchActions();
  }, []);

  const selected = actions.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    setNote(selected?.internalNote ?? "");
    setError(null);
  }, [selected?.id, selected?.internalNote]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((row) =>
      [row.userName, row.userEmail, row.companyName, row.companyReference]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [actions, query]);

  const listRows = useMemo(() => {
    return [...visible].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return createdSort === "desc" ? diff : -diff;
    });
  }, [visible, createdSort]);

  const updateStatus = async (id: string, status: PipelineStatus) => {
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/admin/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "No se pudo cambiar el estado.");
      return;
    }
    await fetchActions();
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await authFetch(`/api/admin/actions/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNote: note }),
    });
    setSaving(false);
    if (res.ok) await fetchActions();
  };

  const moment = selected ? buyerMomentCopy(selected.status) : null;
  const primaryAction =
    selected?.status === "IN_REVIEW"
      ? { label: "Conceder acceso al teaser →", status: "TEASER" as const }
      : selected?.status === "CONVERSATIONS"
        ? { label: "Marcar como cerrada", status: "CLOSED" as const }
        : null;

  return (
    <main className="mx-auto max-w-[90rem]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80">CRM</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--brand-dark)]">Solicitudes de información</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/75">
            Cada tarjeta es una solicitud. Ábrela para ver el recorrido, la nota interna y lo que el comprador está viendo ahora mismo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white p-1 text-sm">
            <button
              type="button"
              onClick={() => setView("pipeline")}
              className={`rounded-full px-3 py-1.5 font-semibold ${view === "pipeline" ? "bg-[var(--brand-primary)] text-white" : "text-slate-600"}`}
            >
              Pipeline
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-full px-3 py-1.5 font-semibold ${view === "list" ? "bg-[var(--brand-primary)] text-white" : "text-slate-600"}`}
            >
              Lista
            </button>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : view === "list" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Actualizada</th>
                <th className="px-4 py-3 text-right" aria-sort={createdSort === "desc" ? "descending" : "ascending"}>
                  <button
                    type="button"
                    onClick={() => setCreatedSort((current) => (current === "desc" ? "asc" : "desc"))}
                    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-slate-700 hover:text-[var(--brand-primary)]"
                    title={createdSort === "desc" ? "De más reciente a más antigua" : "De más antigua a más reciente"}
                  >
                    Creada
                    {createdSort === "desc" ? <ArrowDown className="h-3.5 w-3.5" aria-hidden /> : <ArrowUp className="h-3.5 w-3.5" aria-hidden />}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {listRows.map((row) => (
                <tr key={row.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => setSelectedId(row.id)}>
                  <td className="px-4 py-3">{row.userName || row.userEmail}</td>
                  <td className="px-4 py-3">{row.companyName}</td>
                  <td className="px-4 py-3">{PIPELINE_STATUS_LABELS[row.status]}</td>
                  <td className="px-4 py-3 text-slate-500">{ageLabel(new Date(row.statusUpdatedAt))}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">{formatCreatedDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STATUSES.map((status) => {
            const rows = visible.filter((row) => row.status === status);
            return (
              <section key={status} className="w-64 shrink-0">
                <div className={`mb-2 h-1 rounded-full ${COLUMN_ACCENT[status]}`} />
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">{PIPELINE_STATUS_LABELS[status]}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{rows.length}</span>
                </div>
                <div className="space-y-2">
                  {rows.map((row) => {
                    const waited = ageLabel(new Date(row.statusUpdatedAt));
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className={`w-full rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:border-[var(--brand-primary)]/40 ${
                          selectedId === row.id ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-800">
                            {initials(row.userName, row.userEmail)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">{row.userName || row.userEmail}</span>
                            <span className="block truncate text-xs text-slate-500">{row.companyName}</span>
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-semibold uppercase">
                          {!row.ndaSigned && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800">sin NDA</span>}
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{waited}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {selected && moment && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-slate-900/30" aria-label="Cerrar detalle" onClick={() => setSelectedId(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Solicitud</p>
                  <h2 className="text-lg font-bold text-slate-900">{selected.userName || selected.userEmail}</h2>
                  <p className="text-sm text-slate-500">{selected.userEmail}</p>
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">
                  Cerrar
                </button>
              </div>
            </div>
            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">{selected.companyName}</p>
                {selected.companyReference && <p className="text-xs text-slate-500">#{selected.companyReference}</p>}
                {!selected.companyId.startsWith("mock-") && (
                  <Link href={`/admin/companies/${selected.companyId}`} className="mt-1 inline-block text-xs font-semibold text-[var(--brand-primary)] hover:underline">
                    Abrir empresa
                  </Link>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {selected.ndaSigned ? "Mandato firmado" : "Sin mandato"} · {selected.dniVerified ? "DNI validado" : "DNI pendiente"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recorrido de la solicitud</p>
                <ol className="mt-3 space-y-2">
                  {(selected.history.length > 0 ? selected.history : [{ id: "now", type: "INFO_REQUEST_CREATED", metadata: { to: selected.status }, createdAt: selected.createdAt }]).map((event) => (
                    <li key={event.id} className="text-sm text-slate-700">
                      <span className="font-medium">{eventLabel(event)}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {new Date(event.createdAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-950">
                <p className="text-[11px] font-bold uppercase tracking-wide text-violet-700">Así lo ve el comprador ahora mismo</p>
                <p className="mt-2 font-semibold">“{moment.title}”</p>
                <p className="mt-1 text-violet-950/80">{moment.body}</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-400" htmlFor="internal-note">
                  Nota interna — no visible para el comprador
                </label>
                <textarea
                  id="internal-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => void saveNote()} disabled={saving} className="mt-2 text-xs font-semibold text-[var(--brand-primary)] hover:underline disabled:opacity-60">
                  Guardar nota
                </button>
              </div>

              {primaryAction && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void updateStatus(selected.id, primaryAction.status)}
                  className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {primaryAction.label}
                </button>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-400" htmlFor="manual-status">
                  Cambiar estado manualmente
                </label>
                <select
                  id="manual-status"
                  value={selected.status}
                  disabled={saving}
                  onChange={(e) => void updateStatus(selected.id, e.target.value as PipelineStatus)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
                >
                  {PIPELINE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {PIPELINE_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Úsalo cuando el comprador no actúa o el paso no es automático — por ejemplo, para forzar el paso a Teaser o marcarla como Rechazada.
                </p>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </aside>
        </>
      )}
    </main>
  );
}
