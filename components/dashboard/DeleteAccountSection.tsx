"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-client";

const SUCCESS_MESSAGE =
  "Solicitud de eliminación de cuenta enviada correctamente. Te llegará un correo cuando tu cuenta haya sido eliminada.";

const ALREADY_MESSAGE =
  "Ya has enviado una solicitud de eliminación de cuenta. Te llegará un correo cuando tu cuenta haya sido eliminada.";

export default function DeleteAccountSection({ initialPending }: { initialPending: boolean }) {
  const [pending, setPending] = useState(initialPending);
  const [message, setMessage] = useState<string | null>(initialPending ? ALREADY_MESSAGE : null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onRequest = async () => {
    if (pending || submitting) return;
    const accepted = window.confirm(
      "¿Enviar la solicitud de eliminación de tu cuenta?\n\nNo se eliminará hasta que un administrador la confirme. Te avisaremos por correo cuando se haya eliminado."
    );
    if (!accepted) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await authFetch("/api/user/account-deletion", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadyPending?: boolean;
      };
      if (!res.ok) {
        setError(data.error || "No se pudo enviar la solicitud.");
        return;
      }
      setPending(true);
      setMessage(data.alreadyPending ? ALREADY_MESSAGE : SUCCESS_MESSAGE);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-white shadow-md p-6">
      <h2 className="text-lg font-semibold text-red-950">Eliminar cuenta</h2>
      <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
        Puedes solicitar la eliminación de tu cuenta. No se borra en este momento: queda pendiente
        hasta que un administrador la confirme. Cuando se elimine, te avisaremos por correo.
      </p>

      {message && (
        <p
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
          role="status"
        >
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void onRequest()}
        disabled={pending || submitting}
        className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Solicitud enviada" : submitting ? "Enviando…" : "Solicitar eliminación de cuenta"}
      </button>
    </section>
  );
}
