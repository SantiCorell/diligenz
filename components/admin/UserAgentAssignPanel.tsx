"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-client";

type AgentOption = { id: string; name: string; active: boolean };

export default function UserAgentAssignPanel({
  userId,
  assignedAgentId,
  servicesAgentId,
  onSaved,
}: {
  userId: string;
  assignedAgentId: string | null;
  servicesAgentId: string | null;
  onSaved: () => void;
}) {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [value, setValue] = useState(assignedAgentId ?? "");
  const [servicesValue, setServicesValue] = useState(servicesAgentId ?? "");
  const [saving, setSaving] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [servicesMessage, setServicesMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setValue(assignedAgentId ?? "");
    setServicesValue(servicesAgentId ?? "");
  }, [assignedAgentId, servicesAgentId, userId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await authFetch("/api/admin/agents");
      const data = (await res.json().catch(() => ({}))) as { agents?: AgentOption[] };
      if (!cancelled && res.ok) setAgents(data.agents ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedAgentId: value || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "No se pudo asignar el agente." });
        setSaving(false);
        return;
      }
      setMessage({ type: "ok", text: "Agente asignado." });
      onSaved();
    } catch {
      setMessage({ type: "error", text: "Error de conexión." });
    }
    setSaving(false);
  };

  const saveServices = async () => {
    setSavingServices(true);
    setServicesMessage(null);
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicesAgentId: servicesValue || null }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setServicesMessage({ type: "error", text: data.error || "No se pudo asignar el gestor." });
        setSavingServices(false);
        return;
      }
      setServicesMessage({ type: "ok", text: "Gestor de servicios asignado." });
      onSaved();
    } catch {
      setServicesMessage({ type: "error", text: "Error de conexión." });
    }
    setSavingServices(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--brand-primary)]">Agente asignado</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-h-11 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            aria-label="Agente asignado"
          >
            <option value="">Sin agente</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
                {agent.active ? "" : " (inactivo)"}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="min-h-11 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar agente"}
          </button>
          {message && (
            <span className={message.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
              {message.text}
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold text-[var(--brand-primary)]">Gestor de servicios</p>
        <p className="mb-3 text-xs text-slate-500">
          Aparece en el panel de servicios. Se guarda aparte del agente del perfil.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={servicesValue}
            onChange={(event) => setServicesValue(event.target.value)}
            className="min-h-11 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            aria-label="Gestor de servicios"
          >
            <option value="">Sin gestor de servicios</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
                {agent.active ? "" : " (inactivo)"}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={savingServices}
            onClick={() => void saveServices()}
            className="min-h-11 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {savingServices ? "Guardando…" : "Guardar gestor"}
          </button>
          {servicesMessage && (
            <span className={servicesMessage.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
              {servicesMessage.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
