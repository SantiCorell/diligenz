"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  BarChart3,
  Calendar,
  MessageSquare,
  User,
  Tag,
  Globe,
  ChevronDown,
} from "lucide-react";
import LeadCardActions from "@/components/admin/LeadCardActions";
import {
  LEAD_CATEGORY_LABELS,
  normalizeLeadCategory,
  type LeadCategory,
} from "@/lib/lead-category";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { sectorLabel } from "@/lib/valuation-sectors";
import { formatCompactEuroRange, formatEuroAmount } from "@/lib/format-financial";

export type SerializedValuationLead = {
  id: string;
  email: string;
  phone: string;
  companyName: string | null;
  sector: string;
  sectorSubcategory: string | null;
  cnae: string | null;
  location: string;
  revenue: number;
  ebitda: number | null;
  exerciseResult: number | null;
  employees: number | null;
  description: string | null;
  minValue: number;
  maxValue: number;
  companyType: string | null;
  yearsOperating: number | null;
  revenueGrowthPercent: number | null;
  stage: string | null;
  hasReceivedFunding: boolean | null;
  arr: number | null;
  website: string | null;
  category: string;
  createdAt: string;
};

export type SerializedContactLead = {
  id: string;
  source: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  contactPerson: string | null;
  subject: string | null;
  message: string | null;
  category: string;
  createdAt: string;
};

export type SerializedLeadRow =
  | { kind: "valuation"; data: SerializedValuationLead }
  | { kind: "contact"; data: SerializedContactLead };

function leadCategoryBadgeClass(cat: LeadCategory) {
  if (cat === "pendiente") return "bg-amber-500/20 text-amber-900";
  if (cat === "gestionado") return "bg-emerald-500/20 text-emerald-900";
  return "bg-red-500/15 text-red-900";
}

function formatLeadDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ValuationLeadDetails({ lead }: { lead: SerializedValuationLead }) {
  return (
    <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-4 border-t border-[var(--brand-primary)]/10 pt-4">
      <div className="rounded-xl bg-[var(--brand-primary)]/10 px-4 py-3">
        <p className="text-xs font-medium text-[var(--brand-primary)] opacity-90 mb-0.5">
          Rango estimado
        </p>
        <p className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
          {formatCompactEuroRange(lead.minValue, lead.maxValue)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/60" />
          <span>{lead.companyName || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/60" />
          <span>
            {sectorLabel(lead.sector)}
            {lead.sectorSubcategory ? ` · ${lead.sectorSubcategory}` : ""}
          </span>
        </div>
        <div>
          <span className="text-[var(--foreground)]/70">Ubicación: </span>
          {ccaaLabel(lead.location)}
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/60" />
          <span>Facturación: {formatEuroAmount(lead.revenue)}</span>
        </div>
        <div>
          <span className="text-[var(--foreground)]/70">EBITDA: </span>
          {lead.ebitda != null ? formatEuroAmount(lead.ebitda) : "—"}
        </div>
        <div>
          <span className="text-[var(--foreground)]/70">Resultado ejercicio: </span>
          {lead.exerciseResult != null ? formatEuroAmount(lead.exerciseResult) : "—"}
        </div>
        {lead.employees != null && (
          <div>
            <span className="text-[var(--foreground)]/70">Empleados: </span>
            {lead.employees}
          </div>
        )}
        {lead.cnae && (
          <div>
            <span className="text-[var(--foreground)]/70">CNAE: </span>
            {lead.cnae}
          </div>
        )}
        {lead.website && (
          <div className="sm:col-span-2 flex items-center gap-2 min-w-0">
            <Globe className="w-4 h-4 shrink-0" />
            <a
              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-primary)] hover:underline truncate"
            >
              {lead.website}
            </a>
          </div>
        )}
      </div>

      {(lead.companyType ||
        lead.yearsOperating != null ||
        lead.revenueGrowthPercent != null ||
        lead.stage ||
        lead.hasReceivedFunding != null ||
        lead.arr != null) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--foreground)] opacity-80">
          {lead.companyType && (
            <span>
              <strong>Tipo:</strong> {lead.companyType}
            </span>
          )}
          {lead.yearsOperating != null && (
            <span>
              <strong>Años:</strong> {lead.yearsOperating}
            </span>
          )}
          {lead.revenueGrowthPercent != null && (
            <span>
              <strong>Crecimiento:</strong> {lead.revenueGrowthPercent}%
            </span>
          )}
          {lead.stage && (
            <span>
              <strong>Etapa:</strong> {lead.stage}
            </span>
          )}
          {lead.hasReceivedFunding === true && (
            <span>
              <strong>Financiación:</strong> Sí
            </span>
          )}
          {lead.arr != null && (
            <span>
              <strong>ARR:</strong> {formatEuroAmount(lead.arr)}
            </span>
          )}
        </div>
      )}

      {lead.description && (
        <div>
          <p className="text-xs font-semibold text-[var(--brand-primary)] opacity-90 mb-1">
            Descripción de la actividad
          </p>
          <p className="text-sm text-[var(--foreground)] opacity-90 whitespace-pre-wrap break-words">
            {lead.description}
          </p>
        </div>
      )}
    </div>
  );
}

function ContactLeadDetails({ lead }: { lead: SerializedContactLead }) {
  const sourceLabel = lead.source === "servicios" ? "Servicios" : "Contacto";
  return (
    <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-4 border-t border-[var(--brand-primary)]/10 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          {sourceLabel}
        </span>
        {lead.type && (
          <span className="rounded-xl bg-[var(--brand-primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--brand-primary)] inline-flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {lead.type === "EMPRESA" ? "Empresa" : "Particular"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/60" />
          <span className="font-medium">{lead.name}</span>
        </div>
        {(lead.companyName || lead.contactPerson) && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/60" />
            <span>
              {lead.companyName || ""}
              {lead.companyName && lead.contactPerson && " · "}
              {lead.contactPerson ? `Contacto: ${lead.contactPerson}` : ""}
            </span>
          </div>
        )}
      </div>

      {(lead.subject || lead.message) && (
        <div className="space-y-2">
          {lead.subject && (
            <p className="text-sm">
              <span className="font-medium text-[var(--brand-primary)]">Asunto: </span>
              {lead.subject}
            </p>
          )}
          {lead.message && (
            <div>
              <p className="text-xs font-semibold text-[var(--brand-primary)] mb-1">Mensaje</p>
              <p className="text-sm whitespace-pre-wrap break-words">{lead.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeadRowCard({
  lead,
  isExpanded,
  onToggle,
}: {
  lead: SerializedLeadRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cat = normalizeLeadCategory(lead.data.category);
  const isValuation = lead.kind === "valuation";
  const data = lead.data;

  return (
    <article className="rounded-xl sm:rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={`w-full text-left px-4 sm:px-5 py-3.5 sm:py-4 transition-colors hover:bg-slate-50/80 ${
          isExpanded ? "bg-violet-50/40 border-b border-[var(--brand-primary)]/10" : ""
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 flex items-start gap-2">
            <ChevronDown
              className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)] transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isValuation
                      ? "bg-amber-500/15 text-amber-800"
                      : "bg-emerald-500/15 text-emerald-800"
                  }`}
                >
                  {isValuation ? "Valoración" : "Contacto"}
                </span>
                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${leadCategoryBadgeClass(cat)}`}
                >
                  {LEAD_CATEGORY_LABELS[cat]}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[var(--brand-dark)] truncate">
                {isValuation
                  ? (data as SerializedValuationLead).companyName ||
                    (data as SerializedValuationLead).email
                  : (data as SerializedContactLead).name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[var(--foreground)]/85">
                <span className="inline-flex items-center gap-1 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{data.email}</span>
                </span>
                {data.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    {data.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  {formatLeadDate(data.createdAt)}
                </span>
                {isValuation && (
                  <span className="font-semibold text-[var(--brand-primary)]">
                    {formatCompactEuroRange(
                      (data as SerializedValuationLead).minValue,
                      (data as SerializedValuationLead).maxValue
                    )}
                  </span>
                )}
              </div>
              {!isExpanded && (
                <p className="mt-1.5 text-[11px] text-[var(--foreground)]/55">
                  Pulsa para ver todo el detalle
                </p>
              )}
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <LeadCardActions
              leadId={data.id}
              kind={isValuation ? "valuation" : "contact"}
              category={data.category}
            />
          </div>
        </div>
      </button>

      {isExpanded &&
        (isValuation ? (
          <ValuationLeadDetails lead={data as SerializedValuationLead} />
        ) : (
          <ContactLeadDetails lead={data as SerializedContactLead} />
        ))}
    </article>
  );
}

export default function AdminLeadsList({ leads }: { leads: SerializedLeadRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-12 text-center">
        <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Aún no hay leads. Aparecerán aquí cuando alguien rellene &quot;Valora tu empresa&quot; o
          el formulario de &quot;Contacto&quot;.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sell"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-primary)] font-medium hover:underline"
          >
            Ver valoración →
          </Link>
          <Link
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-primary)] font-medium hover:underline"
          >
            Ver contacto →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--foreground)]/60 mb-3 px-1">
        {leads.length} lead{leads.length !== 1 ? "s" : ""} · Pulsa en uno para desplegar el detalle
      </p>
      {leads.map((lead) => {
        const id = `${lead.kind}-${lead.data.id}`;
        return (
          <LeadRowCard
            key={id}
            lead={lead}
            isExpanded={expandedId === id}
            onToggle={() => setExpandedId((cur) => (cur === id ? null : id))}
          />
        );
      })}
    </div>
  );
}
