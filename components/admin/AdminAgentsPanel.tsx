"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, UserRound } from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import { agentInitials, agentPhotoSrc } from "@/lib/agent-shared";

type AgentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  photoMime: string | null;
  bookingUrl: string | null;
  active: boolean;
  isDefault: boolean;
  updatedAt: string;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  bookingUrl: "",
  active: true,
  isDefault: false,
};

async function fileToJpegDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 512;
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar la foto.");
  ctx.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function AdminAgentsPanel() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/agents");
      const data = (await res.json().catch(() => ({}))) as { agents?: AgentRow[] };
      if (res.ok) setAgents(data.agents ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setClearPhoto(false);
    setFormOpen(false);
  };

  const startEdit = (agent: AgentRow) => {
    setEditingId(agent.id);
    setForm({
      name: agent.name,
      email: agent.email,
      phone: agent.phone ?? "",
      bookingUrl: agent.bookingUrl ?? "",
      active: agent.active,
      isDefault: agent.isDefault,
    });
    setPhotoFile(null);
    setClearPhoto(false);
    setFormOpen(true);
    setMessage(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        bookingUrl: form.bookingUrl,
        active: form.active,
        isDefault: form.isDefault,
      };
      if (photoFile) body.photoDataUrl = await fileToJpegDataUrl(photoFile);
      if (editingId && clearPhoto) body.clearPhoto = true;
      const res = await authFetch(editingId ? `/api/admin/agents/${editingId}` : "/api/admin/agents", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "No se pudo guardar el agente." });
        setSaving(false);
        return;
      }
      setMessage({ type: "ok", text: editingId ? "Agente actualizado." : "Agente creado." });
      resetForm();
      await load();
    } catch {
      setMessage({ type: "error", text: "No se pudo preparar la foto o guardar el agente." });
    }
    setSaving(false);
  };

  const remove = async (agent: AgentRow) => {
    if (
      !confirm(
        `¿Eliminar a ${agent.name}?\n\nLos usuarios que lo tengan asignado se quedarán sin agente y se borrarán sus reuniones con él.`
      )
    ) {
      return;
    }
    const res = await authFetch(`/api/admin/agents/${agent.id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "No se pudo eliminar." });
      return;
    }
    if (editingId === agent.id) resetForm();
    await load();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
        <UserRound className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-800">Agentes</h2>
        <span className="text-xs font-normal text-slate-500">
          {agents.length} {agents.length === 1 ? "agente" : "agentes"}
        </span>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Crea los gestores que se pueden asignar a compradores, vendedores y profesionales. Si el agente tiene un enlace de Calendly (u otra agenda), el usuario podrá reservar desde su panel y la reunión quedará en su calendario.
          </p>
          <p className="text-xs text-slate-500">
            Con la variable <span className="font-mono">CALENDLY_API_TOKEN</span> la hora se guarda sola al reservar. Sin ella, el usuario confirma la hora al terminar.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setPhotoFile(null);
                setClearPhoto(false);
                setFormOpen(true);
              }}
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Nuevo agente
            </button>
            {message && (
              <span className={message.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
                {message.text}
              </span>
            )}
          </div>

          {formOpen && (
            <form onSubmit={(event) => void save(event)} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Nombre</label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  placeholder="Jose Cañizares"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  placeholder="jose@diligenz.es"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  placeholder="623 941 511"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Enlace de agenda</label>
                <input
                  value={form.bookingUrl}
                  onChange={(event) => setForm((current) => ({ ...current, bookingUrl: event.target.value }))}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  placeholder="https://calendly.com/…"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Foto de perfil</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setPhotoFile(event.target.files?.[0] ?? null);
                    setClearPhoto(false);
                  }}
                  className="block w-full text-sm text-slate-600"
                />
                {editingId && (
                  <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={clearPhoto} onChange={(event) => setClearPhoto(event.target.checked)} />
                    Quitar foto actual
                  </label>
                )}
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Activo
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
                />
                Asignar por defecto a los usuarios nuevos
              </label>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Guardando…" : editingId ? "Guardar agente" : "Crear agente"}
                </button>
                <button type="button" onClick={resetForm} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando agentes…</p>
          ) : agents.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay agentes.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {agents.map((agent) => {
                const photo = agentPhotoSrc(agent);
                return (
                  <li key={agent.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-12 w-12 rounded-full object-cover object-[center_20%]" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-800">
                        {agentInitials(agent.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {agent.name}
                        {agent.isDefault && (
                          <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                            Por defecto
                          </span>
                        )}
                        {!agent.active && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            Inactivo
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-slate-600">
                        {agent.email}
                        {agent.phone ? ` · ${agent.phone}` : ""}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {agent.bookingUrl || "Sin enlace de agenda"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(agent)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(agent)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700"
                        aria-label={`Eliminar a ${agent.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
    </section>
  );
}
