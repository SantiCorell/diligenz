"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-client";

export type StepAttachment = { id: string; name: string };

export type StepWithFiles = {
  id: string;
  title: string;
  detail?: string | null;
  done: boolean;
  documents: StepAttachment[];
};

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

  const saveSteps = async (next: StepWithFiles[]) => {
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/admin/servicios/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: next.map((step) => ({
          id: step.id,
          title: step.title,
          detail: step.detail ?? "",
          done: step.done,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "No se han podido guardar los pasos.");
      return;
    }
    setRows(next);
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
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={step.done}
                    disabled={saving}
                    onChange={(event) => {
                      const next = rows.map((item) => (item.id === step.id ? { ...item, done: event.target.checked } : item));
                      void saveSteps(next);
                    }}
                  />
                  Hecho
                </label>
              ) : step.done ? (
                <span className="text-xs font-semibold text-[#7c4dff]">Hecho</span>
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
          </li>
        ) : null)}
      </ul>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
