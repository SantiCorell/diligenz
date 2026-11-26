"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { authFetch } from "@/lib/auth-client";

export type StepAttachment = { id: string; name: string };

export type StepWithFiles = {
  id: string;
  title: string;
  detail?: string | null;
  done: boolean;
  clientComment?: string | null;
  documents: StepAttachment[];
};

function commentOrNull(value: string | null | undefined) {
  const trimmed = value?.trim().slice(0, 2000) ?? "";
  return trimmed || null;
}

export default function StepAttachments({
  serviceId,
  steps,
  editable,
}: {
  serviceId: string;
  steps: StepWithFiles[];
  editable: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(steps.map((step) => ({ ...step, documents: step.documents ?? [] })));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedComments = useRef(new Map(steps.map((step) => [step.id, commentOrNull(step.clientComment)])));

  const saveSteps = async (next: StepWithFiles[]) => {
    const normalized = next.map((step) => ({ ...step, clientComment: commentOrNull(step.clientComment) }));
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/admin/servicios/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: normalized.map((step) => ({
          id: step.id,
          title: step.title,
          detail: step.detail ?? "",
          done: step.done,
          clientComment: step.clientComment,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "No se han podido guardar los pasos.");
      return;
    }
    setRows(normalized);
    for (const step of normalized) savedComments.current.set(step.id, step.clientComment ?? null);
    router.refresh();
  };

  const upload = async (stepId: string, file: File) => {
    const form = new FormData();
    form.set("file", file);
    form.set("stepId", stepId);
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/admin/servicios/${serviceId}/documents`, { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { error?: string; document?: StepAttachment };
    setSaving(false);
    if (!res.ok || !data.document) {
      setError(data.error || "No se ha podido adjuntar el archivo.");
      return;
    }
    setRows((current) =>
      current.map((step) =>
        step.id === stepId ? { ...step, documents: [data.document!, ...step.documents] } : step
      )
    );
    router.refresh();
  };

  const remove = async (stepId: string, docId: string) => {
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/admin/servicios/${serviceId}/documents/${docId}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "No se ha podido quitar el archivo.");
      return;
    }
    setRows((current) =>
      current.map((step) =>
        step.id === stepId ? { ...step, documents: step.documents.filter((file) => file.id !== docId) } : step
      )
    );
  };

  const removeStep = (stepId: string) => {
    const next = rows.filter((step) => step.id !== stepId);
    if (next.length < 1) {
      setError("Tiene que quedar al menos un paso.");
      return;
    }
    void saveSteps(next);
  };

  if (!editable && rows.every((step) => step.documents.length === 0)) return null;

  return (
    <section className="rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--brand-dark)]">Documentos de cada paso</h2>
      <p className="mt-1 text-sm text-[var(--foreground)]/60">
        {editable
          ? "Adjunta facturas y documentos al paso correspondiente. El cliente los ve en su ficha."
          : "Facturas y documentos que el equipo ha añadido a cada paso."}
      </p>
      <ul className="mt-4 divide-y divide-[#f3eef8]">
        {rows.map((step, index) => editable || step.documents.length > 0 ? (
          <li key={step.id} className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                {index + 1}. {step.title}
              </p>
              {editable ? (
                <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => removeStep(step.id)}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  Quitar paso
                </button>
                <label
                  className={`inline-flex min-h-8 cursor-pointer select-none items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-[#7c4dff]/35 focus-within:ring-offset-1 ${
                    step.done
                      ? "border-[#7c4dff] bg-[#7c4dff] text-white"
                      : "border-[#e6dfef] bg-white text-[var(--foreground)]/50 hover:border-[#d9d0e6] hover:bg-[#faf8fc]"
                  } ${saving ? "cursor-wait opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={step.done}
                    disabled={saving}
                    onChange={(event) => {
                      const next = rows.map((item) => (item.id === step.id ? { ...item, done: event.target.checked } : item));
                      void saveSteps(next);
                    }}
                  />
                  {step.done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-current" aria-hidden />
                  )}
                  Hecho
                </label>
                </div>
              ) : step.done ? (
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#7c4dff] px-3 py-1 text-xs font-semibold text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  Hecho
                </span>
              ) : null}
            </div>
            <ul className="mt-2 space-y-1">
              {step.documents.map((file) => (
                <li key={file.id} className="flex items-center justify-between gap-3 text-sm">
                  <a href={`/api/servicios/documents/${file.id}`} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-[var(--brand-primary)]">
                    {file.name}
                  </a>
                  {editable ? (
                    <button type="button" onClick={() => void remove(step.id, file.id)} className="shrink-0 text-xs font-semibold text-slate-500 hover:text-red-600">
                      Quitar
                    </button>
                  ) : null}
                </li>
              ))}
              {step.documents.length === 0 ? <li className="text-xs text-[var(--foreground)]/45">Sin documentos en este paso.</li> : null}
            </ul>
            {editable ? (
              <input
                type="file"
                disabled={saving}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(step.id, file);
                  event.target.value = "";
                }}
                className="mt-2 block w-full text-sm"
              />
            ) : null}
            {editable ? (
              <label className="mt-3 block">
                <span className="text-xs font-semibold text-slate-600">Comentario para el cliente</span>
                <span className="mt-0.5 block text-[11px] font-normal text-[var(--foreground)]/50">
                  El cliente lo verá bajo este paso. Si lo dejas vacío, no se muestra.
                </span>
                <textarea
                  value={step.clientComment ?? ""}
                  rows={2}
                  maxLength={2000}
                  disabled={saving}
                  placeholder="Escribe una nota para el cliente"
                  onChange={(event) => {
                    const value = event.target.value;
                    setRows((current) => current.map((item) => (item.id === step.id ? { ...item, clientComment: value } : item)));
                  }}
                  onBlur={(event) => {
                    const clientComment = commentOrNull(event.target.value);
                    if (savedComments.current.get(step.id) === clientComment) {
                      if ((step.clientComment ?? null) !== clientComment) {
                        setRows((current) => current.map((item) => (item.id === step.id ? { ...item, clientComment } : item)));
                      }
                      return;
                    }
                    const next = rows.map((item) => (item.id === step.id ? { ...item, clientComment } : item));
                    void saveSteps(next);
                  }}
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-[var(--brand-dark)] placeholder:text-slate-400"
                />
              </label>
            ) : null}
          </li>
        ) : null)}
      </ul>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
