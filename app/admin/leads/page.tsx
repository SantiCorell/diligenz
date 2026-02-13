import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
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
} from "lucide-react";
import type { ValuationLead, ContactRequest } from "@prisma/client";
import { Suspense } from "react";
import LeadsFiltersSort from "@/components/admin/LeadsFiltersSort";
import LeadCardActions from "@/components/admin/LeadCardActions";

type LeadRow =
  | { kind: "valuation"; data: ValuationLead }
  | { kind: "contact"; data: ContactRequest };

function getLeadDate(lead: LeadRow): Date {
  return new Date(lead.data.createdAt);
}

function sortLeads(leads: LeadRow[], orden: string): LeadRow[] {
  const arr = [...leads];
  switch (orden) {
    case "fecha_asc":
      return arr.sort((a, b) => getLeadDate(a).getTime() - getLeadDate(b).getTime());
    case "fecha_desc":
      return arr.sort((a, b) => getLeadDate(b).getTime() - getLeadDate(a).getTime());
    case "valoracion_desc":
      return arr.sort((a, b) => {
        if (a.kind !== "valuation" && b.kind !== "valuation") return getLeadDate(b).getTime() - getLeadDate(a).getTime();
        if (a.kind !== "valuation") return 1;
        if (b.kind !== "valuation") return -1;
        return (b.data as ValuationLead).maxValue - (a.data as ValuationLead).maxValue;
      });
    case "valoracion_asc":
      return arr.sort((a, b) => {
        if (a.kind !== "valuation" && b.kind !== "valuation") return getLeadDate(a).getTime() - getLeadDate(b).getTime();
        if (a.kind !== "valuation") return 1;
        if (b.kind !== "valuation") return -1;
        return (a.data as ValuationLead).minValue - (b.data as ValuationLead).minValue;
      });
    case "facturacion_desc":
      return arr.sort((a, b) => {
        if (a.kind !== "valuation" && b.kind !== "valuation") return getLeadDate(b).getTime() - getLeadDate(a).getTime();
        if (a.kind !== "valuation") return 1;
        if (b.kind !== "valuation") return -1;
        return (b.data as ValuationLead).revenue - (a.data as ValuationLead).revenue;
      });
    case "facturacion_asc":
      return arr.sort((a, b) => {
        if (a.kind !== "valuation" && b.kind !== "valuation") return getLeadDate(a).getTime() - getLeadDate(b).getTime();
        if (a.kind !== "valuation") return 1;
        if (b.kind !== "valuation") return -1;
        return (a.data as ValuationLead).revenue - (b.data as ValuationLead).revenue;
      });
    default:
      return arr.sort((a, b) => getLeadDate(b).getTime() - getLeadDate(a).getTime());
  }
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; tipo?: string; orden?: string }>;
}) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const categoria = params.categoria && ["activo", "pruebas", "archivado"].includes(params.categoria) ? params.categoria : undefined;
  const tipo = params.tipo === "valoracion" || params.tipo === "contacto" ? params.tipo : undefined;
  const orden = params.orden ?? "fecha_desc";

  const whereValuation = categoria ? { category: categoria } : {};
  const whereContact = categoria ? { category: categoria } : {};

  const [valuationLeads, contactRequests] = await Promise.all([
    prisma.valuationLead.findMany({ where: whereValuation, orderBy: { createdAt: "desc" } }),
    prisma.contactRequest.findMany({ where: whereContact, orderBy: { createdAt: "desc" } }),
  ]);

  let allLeads: LeadRow[] = [
    ...(tipo !== "contacto" ? valuationLeads.map((data) => ({ kind: "valuation" as const, data })) : []),
    ...(tipo !== "valoracion" ? contactRequests.map((data) => ({ kind: "contact" as const, data })) : []),
  ];
  allLeads = sortLeads(allLeads, orden);

  const totalLeads = allLeads.length;
  const countValuation = allLeads.filter((l) => l.kind === "valuation").length;
  const countContact = allLeads.filter((l) => l.kind === "contact").length;

  const ordenLabel = orden === "fecha_desc" ? "más reciente primero" : orden === "fecha_asc" ? "más antigua primero" : orden.startsWith("valoracion") ? "por valoración" : orden.startsWith("facturacion") ? "por facturación" : "por fecha";

  return (
    <main className="max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 mb-2">
          CRM
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Leads
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
          Personas que han rellenado &quot;Valora tu empresa&quot; o el formulario de
          &quot;Contactar&quot;. Aquí aparecen todos para dar seguimiento.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
          {totalLeads} lead{totalLeads !== 1 ? "s" : ""} mostrados
          {totalLeads > 0 &&
            ` (${countValuation} valoración${countValuation !== 1 ? "es" : ""}, ${countContact} contacto${countContact !== 1 ? "s" : ""})`}
          . Orden: {ordenLabel}.
        </p>
      </div>

      <Suspense fallback={<div className="h-20 rounded-xl bg-white border border-[var(--brand-primary)]/10 animate-pulse mb-6" />}>
        <LeadsFiltersSort />
      </Suspense>

      {allLeads.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-12 text-center">
          <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90">
            Aún no hay leads. Aparecerán aquí cuando alguien rellene &quot;Valora tu
            empresa&quot; o el formulario de &quot;Contacto&quot;.
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
      ) : (
        <div className="space-y-4">
          {allLeads.map((lead) =>
            lead.kind === "valuation" ? (
              <ValuationLeadCard key={`v-${lead.data.id}`} lead={lead.data} />
            ) : (
              <ContactLeadCard key={`c-${lead.data.id}`} lead={lead.data} />
            )
          )}
        </div>
      )}
    </main>
  );
}

function ValuationLeadCard({ lead }: { lead: ValuationLead }) {
  const categoryLabel = lead.category === "pruebas" ? "Pruebas" : lead.category === "archivado" ? "Archivado" : lead.category === "activo" ? "Activo" : null;
  return (
    <article className="rounded-xl sm:rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md overflow-hidden">
      {/* Barra de acciones: categoría + eliminar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 md:px-6 py-3 border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]/50">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryLabel && (
            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              lead.category === "pruebas" ? "bg-amber-500/20 text-amber-800" :
              lead.category === "archivado" ? "bg-slate-400/20 text-slate-700" :
              "bg-emerald-500/20 text-emerald-800"
            }`}>
              {categoryLabel}
            </span>
          )}
        </div>
        <LeadCardActions leadId={lead.id} kind="valuation" category={lead.category} />
      </div>
      {/* Móvil: bloques bien separados y táctiles. Escritorio: fila con wrap */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Tipo + Rango: en móvil arriba como cabecera de la tarjeta */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 pb-4 border-b border-[var(--brand-primary)]/10">
          <span className="rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-700 shrink-0 inline-flex items-center justify-center">
            Valoración
          </span>
          <div className="rounded-xl bg-[var(--brand-primary)]/10 px-4 py-3 flex-1 min-w-0 text-center">
            <p className="text-xs font-medium text-[var(--brand-primary)] opacity-90 mb-0.5">
              Rango estimado
            </p>
            <p className="text-lg sm:text-xl font-bold text-[var(--brand-primary)] truncate">
              {lead.minValue.toLocaleString("es-ES")} – {lead.maxValue.toLocaleString("es-ES")} €
            </p>
          </div>
        </div>

        {/* Contacto: en móvil lista vertical clara */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <Mail className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <a href={`mailto:${lead.email}`} className="text-sm sm:text-base text-[var(--brand-primary)] hover:underline truncate break-all">
              {lead.email}
            </a>
          </div>
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <Phone className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <a href={`tel:${lead.phone}`} className="text-sm sm:text-base text-[var(--brand-primary)] hover:underline">
              {lead.phone}
            </a>
          </div>
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <Calendar className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <span className="text-sm text-[var(--foreground)] opacity-90">
              {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <Building2 className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <span className="text-sm text-[var(--foreground)] truncate">
              {lead.companyName || "—"}
            </span>
          </div>
          {lead.website && (
            <div className="flex items-center gap-3 min-h-[44px] py-1 sm:col-span-2 lg:col-span-1">
              <Globe className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
              <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--brand-primary)] hover:underline truncate break-all">
                {lead.website}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-0">
      <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-3 min-h-[40px]">
          <MapPin className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/50" />
          <span>{lead.sector}</span>
        </div>
        <div className="flex items-center gap-3 min-h-[40px]">
          <span className="text-[var(--foreground)] opacity-70 shrink-0">Ubicación:</span>
          <span>{lead.location}</span>
        </div>
        <div className="flex items-center gap-3 min-h-[40px]">
          <BarChart3 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/50" />
          <span>Facturación: {lead.revenue.toLocaleString("es-ES")} €</span>
        </div>
        <div className="flex items-start sm:items-center gap-2 min-h-[40px] flex-wrap">
          <span className="text-[var(--foreground)] opacity-70">EBITDA: </span>
          <span>{lead.ebitda != null ? `${lead.ebitda.toLocaleString("es-ES")} €` : "—"}</span>
          {lead.employees != null && (
            <>
              <span className="text-[var(--foreground)] opacity-70">· Empleados: </span>
              <span>{lead.employees}</span>
            </>
          )}
        </div>
        {(lead.companyType || lead.yearsOperating != null || lead.revenueGrowthPercent != null || lead.stage || lead.hasReceivedFunding != null || lead.arr != null) && (
          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--foreground)] opacity-80">
            {lead.companyType && <span><strong>Tipo:</strong> {lead.companyType}</span>}
            {lead.yearsOperating != null && <span><strong>Años:</strong> {lead.yearsOperating}</span>}
            {lead.revenueGrowthPercent != null && <span><strong>Crecimiento:</strong> {lead.revenueGrowthPercent}%</span>}
            {lead.stage && <span><strong>Etapa:</strong> {lead.stage}</span>}
            {lead.hasReceivedFunding === true && <span><strong>Financiación:</strong> Sí</span>}
            {lead.arr != null && <span><strong>ARR:</strong> {lead.arr.toLocaleString("es-ES")} €</span>}
          </div>
        )}
      </div>
      </div>

      {lead.description && (
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 mt-4 pt-4 border-t border-[var(--brand-primary)]/10">
          <p className="text-xs font-semibold text-[var(--brand-primary)] opacity-90 mb-1">
            Descripción de la actividad
          </p>
          <p className="text-sm text-[var(--foreground)] opacity-90 whitespace-pre-wrap">
            {lead.description}
          </p>
        </div>
      )}
    </article>
  );
}

function ContactLeadCard({ lead }: { lead: ContactRequest }) {
  const sourceLabel = lead.source === "servicios" ? "Servicios" : "Contacto";
  const categoryLabel = lead.category === "pruebas" ? "Pruebas" : lead.category === "archivado" ? "Archivado" : lead.category === "activo" ? "Activo" : null;
  return (
    <article className="rounded-xl sm:rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md overflow-hidden">
      {/* Barra de acciones: categoría + eliminar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 md:px-6 py-3 border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]/50">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryLabel && (
            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              lead.category === "pruebas" ? "bg-amber-500/20 text-amber-800" :
              lead.category === "archivado" ? "bg-slate-400/20 text-slate-700" :
              "bg-emerald-500/20 text-emerald-800"
            }`}>
              {categoryLabel}
            </span>
          )}
        </div>
        <LeadCardActions leadId={lead.id} kind="contact" category={lead.category} />
      </div>
      <div className="p-4 sm:p-5 md:p-6">
        {/* Badges arriba en móvil */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-[var(--brand-primary)]/10">
          <span className="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            {sourceLabel}
          </span>
          {lead.type && (
            <span className="rounded-xl bg-[var(--brand-primary)]/10 px-3 py-2 text-xs font-medium text-[var(--brand-primary)] flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              {lead.type === "EMPRESA" ? "Empresa" : "Particular"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <User className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <span className="font-medium text-[var(--foreground)] text-sm sm:text-base">{lead.name}</span>
          </div>
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <Mail className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <a href={`mailto:${lead.email}`} className="text-sm sm:text-base text-[var(--brand-primary)] hover:underline truncate break-all">
              {lead.email}
            </a>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-3 min-h-[44px] py-1">
              <Phone className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
              <a href={`tel:${lead.phone}`} className="text-sm sm:text-base text-[var(--brand-primary)] hover:underline">
                {lead.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3 min-h-[44px] py-1">
            <Calendar className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
            <span className="text-sm text-[var(--foreground)] opacity-90">
              {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {(lead.companyName || lead.contactPerson) && (
            <div className="flex items-center gap-3 min-h-[44px] py-1 sm:col-span-2 lg:col-span-1">
              <Building2 className="w-5 h-5 shrink-0 text-[var(--brand-primary)]/70" />
              <span className="text-sm text-[var(--foreground)]">
                {lead.companyName || ""}
                {lead.companyName && lead.contactPerson && " · "}
                {lead.contactPerson ? `Contacto: ${lead.contactPerson}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {(lead.subject || lead.message) && (
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 mt-4 pt-4 border-t border-[var(--brand-primary)]/10 space-y-2">
          {lead.subject && (
            <p className="text-sm">
              <span className="font-medium text-[var(--brand-primary)] opacity-90">Asunto: </span>
              <span className="text-[var(--foreground)] opacity-90">{lead.subject}</span>
            </p>
          )}
          {lead.message && (
            <div>
              <p className="text-xs font-semibold text-[var(--brand-primary)] opacity-90 mb-1">
                Mensaje
              </p>
              <p className="text-sm text-[var(--foreground)] opacity-90 whitespace-pre-wrap">
                {lead.message}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
