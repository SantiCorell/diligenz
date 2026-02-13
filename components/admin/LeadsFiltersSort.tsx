"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORY_OPTIONS = [
  { value: "", label: "Todas las categorías" },
  { value: "activo", label: "Activo" },
  { value: "pruebas", label: "Pruebas" },
  { value: "archivado", label: "Archivado" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "valoracion", label: "Valoración" },
  { value: "contacto", label: "Contacto" },
];

const SORT_OPTIONS = [
  { value: "fecha_desc", label: "Fecha (más reciente)" },
  { value: "fecha_asc", label: "Fecha (más antigua)" },
  { value: "valoracion_desc", label: "Valoración (mayor primero)" },
  { value: "valoracion_asc", label: "Valoración (menor primero)" },
  { value: "facturacion_desc", label: "Facturación (mayor primero)" },
  { value: "facturacion_asc", label: "Facturación (menor primero)" },
];

export default function LeadsFiltersSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("categoria") ?? "";
  const tipo = searchParams.get("tipo") ?? "";
  const orden = searchParams.get("orden") ?? "fecha_desc";

  const setParams = (updates: { categoria?: string; tipo?: string; orden?: string }) => {
    const p = new URLSearchParams(searchParams.toString());
    if (updates.categoria !== undefined) (updates.categoria ? p.set("categoria", updates.categoria) : p.delete("categoria"));
    if (updates.tipo !== undefined) (updates.tipo ? p.set("tipo", updates.tipo) : p.delete("tipo"));
    if (updates.orden !== undefined) (updates.orden && updates.orden !== "fecha_desc" ? p.set("orden", updates.orden) : p.delete("orden"));
    router.push(`/admin/leads?${p.toString()}`);
  };

  return (
    <div className="rounded-xl border border-[var(--brand-primary)]/15 bg-white p-4 shadow-sm mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 mb-3">
        Filtros y ordenación
      </p>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="lead-filter-category" className="block text-xs font-medium text-[var(--foreground)]/80 mb-1">
            Categoría
          </label>
          <select
            id="lead-filter-category"
            value={category}
            onChange={(e) => setParams({ categoria: e.target.value })}
            className="rounded-lg border border-[var(--brand-primary)]/20 bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-filter-type" className="block text-xs font-medium text-[var(--foreground)]/80 mb-1">
            Tipo
          </label>
          <select
            id="lead-filter-type"
            value={tipo}
            onChange={(e) => setParams({ tipo: e.target.value })}
            className="rounded-lg border border-[var(--brand-primary)]/20 bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-sort" className="block text-xs font-medium text-[var(--foreground)]/80 mb-1">
            Ordenar por
          </label>
          <select
            id="lead-sort"
            value={orden}
            onChange={(e) => setParams({ orden: e.target.value })}
            className="rounded-lg border border-[var(--brand-primary)]/20 bg-white px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
