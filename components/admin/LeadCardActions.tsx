"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-client";
import { FolderOpen, Trash2 } from "lucide-react";
import {
  LEAD_CATEGORIES,
  LEAD_CATEGORY_LABELS,
  normalizeLeadCategory,
  type LeadCategory,
} from "@/lib/lead-category";

type Props = {
  leadId: string;
  kind: "valuation" | "contact";
  category: string | null;
};

export default function LeadCardActions({ leadId, kind, category }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"category" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const base = `/api/admin/leads/${kind}`;
  const current = normalizeLeadCategory(category);

  const handleCategoryChange = async (newCategory: LeadCategory) => {
    setLoading("category");
    try {
      const res = await authFetch(`${base}/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading("delete");
    try {
      const res = await authFetch(`${base}/${leadId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-[var(--brand-primary)]/70 shrink-0" aria-hidden />
        <select
          value={current}
          onChange={(e) => handleCategoryChange(e.target.value as LeadCategory)}
          disabled={loading === "category"}
          className="rounded-lg border border-[var(--brand-primary)]/20 bg-white px-3 py-1.5 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30 disabled:opacity-60"
          aria-label="Categoría del lead"
        >
          {LEAD_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {LEAD_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading === "delete"}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          confirmDelete
            ? "bg-red-600 text-white hover:bg-red-700"
            : "text-red-600 hover:bg-red-50 border border-red-200"
        } disabled:opacity-60`}
        aria-label={confirmDelete ? "Confirmar eliminar" : "Eliminar lead"}
      >
        <Trash2 className="w-4 h-4" />
        {confirmDelete ? "¿Eliminar?" : "Eliminar"}
      </button>
    </div>
  );
}
