"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

type ToggleProps = {
  interestId: string;
  enabled: boolean;
  disabled?: boolean;
  onUpdated: (enabled: boolean) => void;
};

export function DriveFolderAccessToggle({
  interestId,
  enabled,
  disabled,
  onUpdated,
}: ToggleProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (next: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch(`/api/admin/actions/${interestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canSeeDriveFolder: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el acceso.");
        return;
      }
      onUpdated(next);
    } catch {
      setError("No se pudo guardar el acceso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[var(--brand-primary)]"
          checked={enabled}
          disabled={disabled || saving}
          onChange={(event) => void toggle(event.target.checked)}
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">Puede ver la carpeta de Drive</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
            Si la empresa tiene carpeta y el comprador pulsa «Quiero avanzar», podrá abrirla.
            {saving ? " Guardando…" : ""}
          </span>
        </span>
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export type DriveAccessRequest = {
  id: string;
  buyerLabel: string;
  statusLabel: string;
  enabled: boolean;
};

export function DriveFolderAccessList({ requests }: { requests: DriveAccessRequest[] }) {
  const [rows, setRows] = useState(requests);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--foreground)]/75">
        Todavía no hay solicitudes. El permiso se activa por comprador cuando pidan información.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="rounded-xl border border-[var(--brand-primary)]/15 px-4 py-3">
          <p className="text-sm font-medium text-[var(--brand-dark)]">{row.buyerLabel}</p>
          <p className="mt-0.5 text-xs text-[var(--foreground)]/60">{row.statusLabel}</p>
          <div className="mt-2">
            <DriveFolderAccessToggle
              interestId={row.id}
              enabled={row.enabled}
              onUpdated={(enabled) =>
                setRows((current) => current.map((item) => (item.id === row.id ? { ...item, enabled } : item)))
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
