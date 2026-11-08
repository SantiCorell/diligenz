"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-client";

export default function AcceptProposalButton({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/me/servicios/${serviceId}/accept`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se ha podido aceptar la propuesta.");
      return;
    }
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void accept()}
        disabled={saving}
        className="rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
      >
        {saving ? "Aceptando…" : "Aceptar propuesta"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
