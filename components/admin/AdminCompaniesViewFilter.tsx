"use client";

import Link from "next/link";
import { FileWarning, Globe, PencilLine, LayoutGrid } from "lucide-react";

export type CompanyViewFilter = "all" | "draft" | "docs" | "published";

type Props = {
  current: CompanyViewFilter;
  /** Query string sin `view` (q, ref, etc.) */
  baseQuery: string;
  counts: {
    all: number;
    draft: number;
    docs: number;
    published: number;
  };
};

function hrefFor(view: CompanyViewFilter, baseQuery: string): string {
  const p = new URLSearchParams(baseQuery);
  if (view === "all") p.delete("view");
  else p.set("view", view);
  const qs = p.toString();
  return qs ? `/admin/companies?${qs}` : "/admin/companies";
}

const BOXES: {
  id: CompanyViewFilter;
  label: string;
  description: string;
  icon: typeof LayoutGrid;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    id: "all",
    label: "Todas",
    description: "Catálogo completo",
    icon: LayoutGrid,
    activeClass: "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-2 ring-[var(--brand-primary)]/20",
    idleClass: "border-slate-200 bg-white hover:border-[var(--brand-primary)]/30 hover:bg-violet-50/30",
  },
  {
    id: "draft",
    label: "Borradores",
    description: "Sin publicar en web",
    icon: PencilLine,
    activeClass: "border-violet-400 bg-violet-50 ring-2 ring-violet-200",
    idleClass: "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40",
  },
  {
    id: "docs",
    label: "Doc. pendiente",
    description: "Falta firmar documentos",
    icon: FileWarning,
    activeClass: "border-amber-400 bg-amber-50 ring-2 ring-amber-200",
    idleClass: "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40",
  },
  {
    id: "published",
    label: "Publicadas",
    description: "Visibles en marketplace",
    icon: Globe,
    activeClass: "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200",
    idleClass: "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40",
  },
];

export default function AdminCompaniesViewFilter({ current, baseQuery, counts }: Props) {
  return (
    <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {BOXES.map((box) => {
        const Icon = box.icon;
        const active = current === box.id;
        const count = counts[box.id];
        return (
          <Link
            key={box.id}
            href={hrefFor(box.id, baseQuery)}
            className={`rounded-2xl border p-4 transition-all ${active ? box.activeClass : box.idleClass}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={`rounded-xl p-2 ${
                  active ? "bg-white/80 text-[var(--brand-primary)]" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden />
              </div>
              <span
                className={`text-lg font-bold tabular-nums ${
                  active ? "text-[var(--brand-dark)]" : "text-slate-700"
                }`}
              >
                {count}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{box.label}</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-snug">{box.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
