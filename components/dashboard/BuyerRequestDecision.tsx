"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowRight, Handshake, X } from "lucide-react";
import { authFetch } from "@/lib/auth-client";

export default function BuyerRequestDecision({ interestId }: { interestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"advance" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advanceConfirmed, setAdvanceConfirmed] = useState(false);
  const [driveFolderGranted, setDriveFolderGranted] = useState(false);

  const reloadAfterAdvance = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (!advanceConfirmed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") reloadAfterAdvance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advanceConfirmed]);

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
      if (decision === "advance") {
        setDriveFolderGranted(Boolean((data as { driveFolderGranted?: boolean }).driveFolderGranted));
        setAdvanceConfirmed(true);
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
      {advanceConfirmed && (
        <AdvanceConfirmedModal driveFolderGranted={driveFolderGranted} onConfirm={reloadAfterAdvance} />
      )}
    </div>
  );
}

function AdvanceConfirmedModal({
  driveFolderGranted,
  onConfirm,
}: {
  driveFolderGranted: boolean;
  onConfirm: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      onClick={onConfirm}
      role="dialog"
      aria-modal="true"
      aria-labelledby="advance-confirmed-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--brand-primary)]/20 bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="advance-confirmed-title" className="text-xl font-semibold text-[var(--brand-dark)]">
          Has solicitado avanzar
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/85">
          {driveFolderGranted
            ? "Te habilitamos la carpeta con toda la documentación de la empresa. Revísala y en breve tu gestor se pondrá en contacto contigo."
            : "En breve tu gestor se pondrá en contacto contigo."}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="mt-6 w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-95"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body,
  );
}
