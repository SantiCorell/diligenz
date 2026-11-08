"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-client";

export default function AdminServicioTools({
  serviceId,
  title,
  priceEur,
  summary,
  status,
  accepted,
  documentsUrl,
  invoicesUrl,
  clientName,
}: {
  serviceId: string;
  title: string;
  priceEur: number;
  summary: string | null;
  status: string;
  accepted: boolean;
  documentsUrl: string | null;
  invoicesUrl: string | null;
  clientName: string;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(String(priceEur));
  const [name, setName] = useState(title);
  const [note, setNote] = useState(summary ?? "");
  const [docs, setDocs] = useState(documentsUrl ?? "");
  const [invoices, setInvoices] = useState(invoicesUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>, ok: string) => {
    setSaving(true);
    setError(null);
    setSaved(null);
    const res = await authFetch(`/api/admin/servicios/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se ha podido guardar.");
      return;
    }
    setSaved(ok);
    router.refresh();
  };

  return (
    <section className="mb-5 rounded-3xl border border-[#ece6f5] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Edición de administración</p>
      <h2 className="mt-1 text-lg font-bold text-[var(--brand-dark)]">{clientName}</h2>
      <p className="mt-1 text-sm text-[var(--foreground)]/60">
        Esta es la misma ficha que ve el cliente. Aquí puedes cambiar el servicio, el precio y los enlaces, y adjuntar archivos en cada paso.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-semibold text-slate-700">Nombre del servicio</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-slate-700">Precio sin IVA (€)</span>
          <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="numeric" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="font-semibold text-slate-700">Nota de honorarios</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-slate-700">Carpeta de documentos (Drive)</span>
          <input value={docs} onChange={(event) => setDocs(event.target.value)} placeholder="https://drive.google.com/..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-slate-700">Carpeta de facturas (Drive)</span>
          <input value={invoices} onChange={(event) => setInvoices(event.target.value)} placeholder="https://drive.google.com/..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const amount = Number(price);
            void patch(
              { title: name, summary: note, priceEur: amount, documentsUrl: docs, invoicesUrl: invoices },
              "Cambios guardados."
            );
          }}
          className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          Guardar ficha
        </button>
        {status !== "COMPLETED" && status !== "DISCARDED" ? (
          <button type="button" disabled={saving} onClick={() => void patch({ status: "COMPLETED" }, "Servicio finalizado.")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Marcar finalizada
          </button>
        ) : null}
        {status !== "DISCARDED" ? (
          <button type="button" disabled={saving} onClick={() => void patch({ status: "DISCARDED" }, "Servicio descartado.")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
            Descartar
          </button>
        ) : null}
        {status === "COMPLETED" || status === "DISCARDED" ? (
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void patch(
                { status: accepted ? "IN_PROGRESS" : "PROPOSAL" },
                accepted ? "El servicio vuelve a estar en marcha." : "El servicio vuelve a ser una propuesta."
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {accepted ? "Volver a en marcha" : "Volver a propuesta"}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="mt-3 text-sm text-emerald-700">{saved}</p> : null}
    </section>
  );
}
