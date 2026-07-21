"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { BuyerDocument } from "@/lib/buyer-documents";

type Row = { label: string; url: string };

type Props = {
  companyId: string;
  attachmentsApproved: boolean;
  initialDocuments: BuyerDocument[];
};

function emptyRow(): Row {
  return { label: "", url: "" };
}

function rowsFromDocs(docs: BuyerDocument[]): Row[] {
  if (docs.length === 0) return [emptyRow()];
  return docs.map((d) => ({ label: d.label, url: d.url }));
}

export default function AdminBuyerDocumentsForm({
  companyId,
  attachmentsApproved,
  initialDocuments,
}: Props) {
  const [rows, setRows] = useState<Row[]>(() => rowsFromDocs(initialDocuments));

  const updateRow = (index: number, field: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [emptyRow()];
    });
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const serializedDocs = JSON.stringify(
    rows
      .map((row, index) => ({
        label: row.label.trim(),
        url: row.url.trim(),
        sortOrder: index,
      }))
      .filter((row) => row.label && row.url)
  );

  return (
    <form
      action="/api/admin/company/update"
      method="POST"
      className="rounded-xl border-2 border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/40 p-5 space-y-4"
    >
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="partial" value="visibility" />
      <input type="hidden" name="buyerDocuments" value={serializedDocs} readOnly />

      <div>
        <p className="text-sm font-semibold text-[var(--brand-primary)]">
          Acceso para compradores
        </p>
        <p className="mt-1 text-xs text-[var(--foreground)] opacity-75">
          Añade uno o varios documentos o enlaces. El nombre será el que vea el comprador en la
          pestaña <strong>Documentos</strong> cuando su solicitud esté en gestión.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-xl border border-[var(--brand-primary)]/15 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]/80">
                Documento {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveRow(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg p-1.5 text-[var(--brand-primary)]/70 hover:bg-[var(--brand-primary)]/10 disabled:opacity-30"
                  title="Subir"
                  aria-label="Subir documento"
                >
                  <GripVertical className="h-4 w-4 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => moveRow(index, 1)}
                  disabled={index === rows.length - 1}
                  className="rounded-lg p-1.5 text-[var(--brand-primary)]/70 hover:bg-[var(--brand-primary)]/10 disabled:opacity-30"
                  title="Bajar"
                  aria-label="Bajar documento"
                >
                  <GripVertical className="h-4 w-4 -rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="rounded-lg p-1.5 text-red-600/80 hover:bg-red-50"
                  title="Eliminar"
                  aria-label="Eliminar documento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]">
                Nombre en la web
              </label>
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateRow(index, "label", e.target.value)}
                placeholder="Ej. Teaser, Cuentas 2024, Memorándum…"
                className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)]">
                Enlace al documento
              </label>
              <input
                type="url"
                value={row.url}
                onChange={(e) => updateRow(index, "url", e.target.value)}
                placeholder="https://drive.google.com/file/d/… o enlace directo al PDF"
                className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[var(--brand-primary)]/25 px-4 py-2.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
      >
        <Plus className="h-4 w-4" />
        Añadir otro documento
      </button>

      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          name="attachmentsApproved"
          id="attachmentsApproved"
          defaultChecked={attachmentsApproved}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
        />
        <span className="text-sm font-medium text-[var(--foreground)]">
          Permitir descarga cuando la solicitud de información esté en gestión
        </span>
      </label>

      <button
        type="submit"
        className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 transition"
      >
        Guardar acceso compradores
      </button>
    </form>
  );
}
