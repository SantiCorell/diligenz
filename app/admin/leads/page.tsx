import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Building2, MapPin, BarChart3, Calendar } from "lucide-react";

export default async function AdminLeadsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/register");

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/login");

  const leads = await prisma.valuationLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalLeads = leads.length;

  return (
    <main className="max-w-6xl mx-auto">
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-80 mb-2">
          CRM
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Leads · Valoraciones
        </h1>
        <p className="mt-3 text-[var(--foreground)] opacity-85 leading-relaxed max-w-2xl">
          Cada vez que alguien rellena el formulario &quot;Valora tu empresa&quot; en la web, se guarda aquí con su correo, teléfono, datos de la empresa y el rango de valoración orientativa. Úsalo como CRM para dar seguimiento y contacto.
        </p>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
          {totalLeads} lead{totalLeads !== 1 ? "s" : ""} en total. Ordenados del más reciente al más antiguo.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-12 text-center shadow-lg">
          <p className="text-[var(--foreground)] opacity-80">
            Aún no hay leads de valoración. Aparecerán aquí cuando alguien rellene el formulario de &quot;Valora tu empresa&quot;.
          </p>
          <Link
            href="/sell"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-[var(--brand-primary)] font-medium hover:underline"
          >
            Ver formulario de valoración →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-2xl border-2 border-[var(--brand-primary)]/15 bg-white p-5 md:p-6 shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/70" />
                    <a href={`mailto:${lead.email}`} className="text-[var(--brand-primary)] hover:underline truncate">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/70" />
                    <a href={`tel:${lead.phone}`} className="text-[var(--brand-primary)] hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/70" />
                    <span className="text-[var(--foreground)] opacity-90">
                      {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/70" />
                    <span className="text-[var(--foreground)] truncate">
                      {lead.companyName || "—"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--brand-primary)]/10 px-4 py-2 text-center shrink-0">
                  <p className="text-xs font-medium text-[var(--brand-primary)] opacity-90">
                    Valoración
                  </p>
                  <p className="text-lg font-bold text-[var(--brand-primary)]">
                    {lead.minValue.toLocaleString("es-ES")} – {lead.maxValue.toLocaleString("es-ES")} €
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/50" />
                  <span>{lead.sector}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--foreground)] opacity-70">Ubicación:</span>
                  <span>{lead.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]/50" />
                  <span>Facturación: {lead.revenue.toLocaleString("es-ES")} €</span>
                </div>
                <div>
                  <span className="text-[var(--foreground)] opacity-70">EBITDA: </span>
                  <span>{lead.ebitda != null ? `${lead.ebitda.toLocaleString("es-ES")} €` : "—"}</span>
                  {lead.employees != null && (
                    <>
                      <span className="text-[var(--foreground)] opacity-70 ml-2">· Empleados: </span>
                      <span>{lead.employees}</span>
                    </>
                  )}
                </div>
              </div>

              {lead.description && (
                <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/10">
                  <p className="text-xs font-semibold text-[var(--brand-primary)] opacity-90 mb-1">
                    Descripción de la actividad
                  </p>
                  <p className="text-sm text-[var(--foreground)] opacity-90 whitespace-pre-wrap">
                    {lead.description}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
