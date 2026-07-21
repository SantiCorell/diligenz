import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { Suspense } from "react";
import LeadsFiltersSort from "@/components/admin/LeadsFiltersSort";
import AdminLeadsList, { type SerializedLeadRow } from "@/components/admin/AdminLeadsList";
import {
  LEAD_CATEGORIES,
  type LeadCategory,
} from "@/lib/lead-category";
import type { ValuationLead, ContactRequest } from "@prisma/client";

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

function serializeLeads(leads: LeadRow[]): SerializedLeadRow[] {
  return leads.map((lead) => {
    if (lead.kind === "valuation") {
      const v = lead.data;
      return {
        kind: "valuation" as const,
        data: {
          ...v,
          createdAt: v.createdAt.toISOString(),
        },
      };
    }
    const c = lead.data;
    return {
      kind: "contact" as const,
      data: {
        ...c,
        createdAt: c.createdAt.toISOString(),
      },
    };
  });
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
  const categoria =
    params.categoria && LEAD_CATEGORIES.includes(params.categoria as LeadCategory)
      ? (params.categoria as LeadCategory)
      : undefined;
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

  const ordenLabel =
    orden === "fecha_desc"
      ? "más reciente primero"
      : orden === "fecha_asc"
        ? "más antigua primero"
        : orden.startsWith("valoracion")
          ? "por valoración"
          : orden.startsWith("facturacion")
            ? "por facturación"
            : "por fecha";

  return (
    <main className="max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 mb-2">
          CRM
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">Leads</h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
          Personas que han rellenado &quot;Valora tu empresa&quot; o el formulario de
          &quot;Contactar&quot;. Pulsa en cada fila para desplegar el detalle.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
          {totalLeads} lead{totalLeads !== 1 ? "s" : ""} mostrados
          {totalLeads > 0 &&
            ` (${countValuation} valoración${countValuation !== 1 ? "es" : ""}, ${countContact} contacto${countContact !== 1 ? "s" : ""})`}
          . Orden: {ordenLabel}.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-20 rounded-xl bg-white border border-[var(--brand-primary)]/10 animate-pulse mb-6" />
        }
      >
        <LeadsFiltersSort />
      </Suspense>

      <AdminLeadsList leads={serializeLeads(allLeads)} />
    </main>
  );
}
