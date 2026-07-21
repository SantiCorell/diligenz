"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  BarChart3,
  MessageSquare,
  Search,
} from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import { formatCompactEuroRange, formatEuroAmount } from "@/lib/format-financial";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { sectorLabel } from "@/lib/valuation-sectors";
import {
  LEAD_CATEGORY_LABELS,
  normalizeLeadCategory,
} from "@/lib/lead-category";
import type { SerializedContactLead, SerializedValuationLead } from "@/components/admin/AdminLeadsList";

type UnregisteredGroup = {
  email: string;
  phone: string | null;
  displayName: string | null;
  valuations: SerializedValuationLead[];
  contactRequests: SerializedContactLead[];
  latestActivity: string;
  valuationCount: number;
  contactCount: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ValuationBlock({ lead }: { lead: SerializedValuationLead }) {
  const cat = normalizeLeadCategory(lead.category);
  return (
    <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
          Valoración · {formatDate(lead.createdAt)}
        </span>
        <span className="rounded-lg px-2 py-0.5 text-[10px] font-medium bg-white/80 text-amber-900">
          {LEAD_CATEGORY_LABELS[cat]}
        </span>
      </div>
      <p className="text-lg font-bold text-[var(--brand-primary)]">
        {formatCompactEuroRange(lead.minValue, lead.maxValue)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <p>
          <span className="text-slate-600">Empresa: </span>
          {lead.companyName || "—"}
        </p>
        <p>
          <span className="text-slate-600">Sector: </span>
          {sectorLabel(lead.sector)}
          {lead.sectorSubcategory ? ` · ${lead.sectorSubcategory}` : ""}
        </p>
        <p>
          <span className="text-slate-600">Ubicación: </span>
          {ccaaLabel(lead.location)}
        </p>
        <p className="flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 opacity-60" />
          Facturación: {formatEuroAmount(lead.revenue)}
        </p>
        <p>
          <span className="text-slate-600">EBITDA: </span>
          {lead.ebitda != null ? formatEuroAmount(lead.ebitda) : "—"}
        </p>
        <p>
          <span className="text-slate-600">Empleados: </span>
          {lead.employees ?? "—"}
        </p>
      </div>
      {lead.description && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.description}</p>
      )}
      <Link
        href="/admin/leads?tipo=valoracion"
        className="text-xs font-medium text-[var(--brand-primary)] hover:underline"
      >
        Ver en Leads →
      </Link>
    </div>
  );
}

function ContactBlock({ lead }: { lead: SerializedContactLead }) {
  const cat = normalizeLeadCategory(lead.category);
  return (
    <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-emerald-800 inline-flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {lead.source === "servicios" ? "Servicios" : "Contacto"} · {formatDate(lead.createdAt)}
        </span>
        <span className="rounded-lg px-2 py-0.5 text-[10px] font-medium bg-white/80 text-emerald-900">
          {LEAD_CATEGORY_LABELS[cat]}
        </span>
      </div>
      <p className="text-sm font-medium">{lead.name}</p>
      {lead.subject && (
        <p className="text-sm">
          <span className="text-slate-600">Asunto: </span>
          {lead.subject}
        </p>
      )}
      {lead.message && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.message}</p>
      )}
      <Link
        href="/admin/leads?tipo=contacto"
        className="text-xs font-medium text-[var(--brand-primary)] hover:underline"
      >
        Ver en Leads →
      </Link>
    </div>
  );
}

function UnregisteredRow({
  group,
  isExpanded,
  onToggle,
}: {
  group: UnregisteredGroup;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const title = group.displayName || group.email;

  return (
    <article className="rounded-xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={`w-full text-left px-4 sm:px-5 py-4 transition-colors hover:bg-slate-50/80 ${
          isExpanded ? "bg-violet-50/40 border-b border-slate-100" : ""
        }`}
      >
        <div className="flex items-start gap-2 min-w-0">
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-[var(--brand-primary)] transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                Sin cuenta
              </span>
              {group.valuationCount > 0 && (
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                  {group.valuationCount} valoración{group.valuationCount !== 1 ? "es" : ""}
                </span>
              )}
              {group.contactCount > 0 && (
                <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-900">
                  {group.contactCount} contacto{group.contactCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-slate-900 truncate">{title}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 min-w-0">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{group.email}</span>
              </span>
              {group.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {group.phone}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                Última actividad: {formatDate(group.latestActivity)}
              </span>
            </div>
            {!isExpanded && (
              <p className="mt-1.5 text-[11px] text-slate-500">Pulsa para ver valoraciones y contactos</p>
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-2 space-y-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${group.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
            >
              <Mail className="w-3.5 h-3.5" />
              Enviar email
            </a>
            {group.phone && (
              <a
                href={`tel:${group.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Phone className="w-3.5 h-3.5" />
                Llamar
              </a>
            )}
          </div>

          {group.valuations.map((v) => (
            <ValuationBlock key={v.id} lead={v} />
          ))}
          {group.contactRequests.map((c) => (
            <ContactBlock key={c.id} lead={c} />
          ))}
        </div>
      )}
    </article>
  );
}

export default function AdminUnregisteredContactsList() {
  const [q, setQ] = useState("");
  const [contacts, setContacts] = useState<UnregisteredGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q.trim()) p.set("q", q.trim());
      const res = await authFetch(`/api/admin/users/unregistered?${p.toString()}`);
      const data = await res.json();
      if (res.ok) setContacts(data.contacts ?? []);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, q.trim() ? 320 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm p-5">
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Contactos con valoraciones o formularios de contacto cuyo email{" "}
          <strong>no tiene cuenta registrada</strong> en Diligenz. Agrupados por email.
        </p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email, nombre o teléfono…"
            className="w-full min-h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 animate-pulse px-1">Cargando contactos…</p>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          No hay contactos sin cuenta con estos criterios.
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 px-1">
            {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} sin cuenta · Pulsa para
            desplegar
          </p>
          {contacts.map((group) => (
            <UnregisteredRow
              key={group.email}
              group={group}
              isExpanded={expandedEmail === group.email}
              onToggle={() =>
                setExpandedEmail((cur) => (cur === group.email ? null : group.email))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
