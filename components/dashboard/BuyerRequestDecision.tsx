"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Handshake, X } from "lucide-react";
import { authFetch } from "@/lib/auth-client";

export default function BuyerRequestDecision({ interestId }: { interestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"advance" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (decision: "advance" | "decline") => {
    setPending(decision);
    setError(null);
    try {
      const res = await authFetch(`/api/me/info-requests/${interestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "No se pudo guardar la decisión.");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-800">
          <Handshake className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-violet-950">Ya tienes el teaser — ¿quieres avanzar con esta operación?</p>
          <p className="mt-1 text-sm text-violet-950/80">
            Si te interesa, pasamos a conversaciones y te damos acceso al dossier completo y el contacto del vendedor. Si no, puedes descartarla y seguimos explorando.
          </p>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => void choose("decline")}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-5 py-2.5 text-sm font-semibold text-violet-950 hover:bg-violet-100 disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          {pending === "decline" ? "Guardando…" : "No me interesa"}
        </button>
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => void choose("advance")}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending === "advance" ? "Guardando…" : "Quiero avanzar"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
