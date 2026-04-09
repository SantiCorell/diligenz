"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Props = {
  email: string;
  initialName: string | null;
  initialPhone: string | null;
  profileVerifiedByAdmin: boolean;
};

export default function ProfileEditor({
  email,
  initialName,
  initialPhone,
  profileVerifiedByAdmin,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const missing: string[] = [];
  if (!name.trim()) missing.push("nombre");
  if (!phone.trim()) missing.push("teléfono");
  const showIncomplete = missing.length > 0 && !profileVerifiedByAdmin;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await authFetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "No se pudo guardar" });
        return;
      }
      setMessage({ type: "ok", text: "Cambios guardados." });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {showIncomplete && (
        <div
          className="rounded-xl border border-amber-300/90 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-semibold">Completa tu perfil</p>
          <p className="mt-1 opacity-95">
            Falta: {missing.join(" · ")}. Rellena los campos de abajo y guarda.
          </p>
        </div>
      )}

      {message && (
        <p
          className={`text-sm font-medium ${message.type === "ok" ? "text-emerald-800" : "text-red-700"}`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-email" className="block text-xs font-medium text-[var(--foreground)] opacity-70">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={email}
            disabled
            className="mt-1 w-full rounded-lg border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] px-3 py-2 text-sm text-[var(--foreground)] opacity-80"
          />
          <p className="mt-1 text-[11px] text-[var(--foreground)] opacity-55">
            El email no se puede cambiar desde aquí.
          </p>
        </div>

        <div>
          <label htmlFor="profile-name" className="block text-xs font-medium text-[var(--foreground)] opacity-70">
            Nombre y apellidos
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={120}
            placeholder="Tu nombre completo"
            className="mt-1 w-full rounded-lg border border-[var(--brand-primary)]/20 bg-white px-3 py-2 text-sm text-[var(--foreground)]"
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className="block text-xs font-medium text-[var(--foreground)] opacity-70">
            Teléfono
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            maxLength={40}
            placeholder="Ej. +34 600 000 000"
            className="mt-1 w-full rounded-lg border border-[var(--brand-primary)]/20 bg-white px-3 py-2 text-sm text-[var(--foreground)]"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
