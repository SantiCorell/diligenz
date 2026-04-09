import Link from "next/link";
import { redirect } from "next/navigation";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveCompanyForBuyerInterest } from "@/lib/buyer-company-resolve";
import { getSessionWithUser } from "@/lib/session";
import CompanyCard from "@/components/companies/CompanyCard";

function statusLabel(s: RequestStatus | null | undefined): string {
  if (!s) return "—";
  if (s === "PENDING") return "En revisión";
  if (s === "MANAGED") return "En gestión";
  return "Cerrada";
}

function statusClass(s: RequestStatus | null | undefined): string {
  if (!s) return "bg-neutral-100 text-neutral-600";
  if (s === "PENDING") return "bg-amber-100 text-amber-900";
  if (s === "MANAGED") return "bg-sky-100 text-sky-900";
  return "bg-neutral-100 text-neutral-600";
}

export default async function MisEmpresasPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login?from=/dashboard/mis-empresas");
  if (
    session.user.role !== "BUYER" &&
    session.user.role !== "PROFESSIONAL" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }
  const userId = session.user.id;

  const interests = await prisma.userCompanyInterest.findMany({
    where: { userId, type: "REQUEST_INFO" },
    orderBy: { createdAt: "desc" },
  });

  const companyIds = [...new Set(interests.map((i) => i.companyId))];
  const resolvedList = await Promise.all(
    companyIds.map((id) => resolveCompanyForBuyerInterest(id))
  );
  const resolvedById = new Map(companyIds.map((id, i) => [id, resolvedList[i]]));

  const byCompany = new Map<string, typeof interests>();
  for (const row of interests) {
    const list = byCompany.get(row.companyId) ?? [];
    list.push(row);
    byCompany.set(row.companyId, list);
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="rounded-xl bg-white border border-[var(--brand-primary)]/10 shadow-sm p-4 md:p-5">
        <h1 className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
          Mis empresas
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--foreground)] opacity-85 max-w-2xl">
          Empresas a las que has pedido información y el estado de cada solicitud.
        </p>
        <div className="mt-3 rounded-lg border border-amber-200/70 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          <p className="font-medium text-amber-950">¿Has solicitado información?</p>
          <p className="mt-0.5 opacity-95 leading-snug">
            Un agente se pondrá en contacto contigo. Revisa el estado de cada empresa abajo.
          </p>
        </div>
      </div>

      {companyIds.length === 0 ? (
        <div className="rounded-xl border border-[var(--brand-primary)]/15 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--foreground)] opacity-90">
            Aún no tienes solicitudes de información. Explora el marketplace y pide datos desde cada
            ficha.
          </p>
          <Link
            href="/companies"
            className="mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 transition"
          >
            Explorar empresas publicadas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {companyIds.map((companyId) => {
            const rows = byCompany.get(companyId) ?? [];
            const resolved = resolvedById.get(companyId)!;
            const infoRows = rows.filter((r) => r.type === "REQUEST_INFO");
            const latestInfo = infoRows[0];
            const name =
              resolved.company?.name ??
              resolved.fallbackName ??
              "Empresa (no disponible)";

            return (
              <div
                key={companyId}
                className="rounded-xl border border-[var(--brand-primary)]/10 bg-white shadow-sm overflow-hidden"
              >
                <div className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]/40 px-3 py-2.5 md:px-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-[var(--brand-primary)] truncate">
                      {name}
                    </h2>
                    {infoRows.length > 0 && (
                      <span className="inline-flex items-center rounded-md bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[10px] font-medium px-1.5 py-0.5">
                        Info solicitada
                      </span>
                    )}
                  </div>
                  {resolved.published && resolved.company ? (
                    <Link
                      href={`/companies/${companyId}`}
                      className="shrink-0 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      Ficha →
                    </Link>
                  ) : (
                    <span className="text-[10px] text-[var(--foreground)] opacity-70 max-w-[14rem] text-right leading-tight">
                      No publicada en catálogo; el equipo puede informarte por otros canales.
                    </span>
                  )}
                </div>

                <div className="p-3 md:px-4 md:pb-3 space-y-2">
                  {infoRows.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-[var(--brand-primary)]/8 bg-[var(--brand-bg)]/30 px-2.5 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={`inline-flex rounded-md text-[10px] font-semibold px-1.5 py-0.5 ${statusClass(r.status)}`}
                        >
                          {statusLabel(r.status)}
                        </span>
                        <span className="text-[10px] text-[var(--foreground)] opacity-65">
                          {new Date(r.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {r.status === "PENDING" && (
                        <p className="mt-1.5 text-[11px] text-[var(--foreground)] opacity-80 leading-snug">
                          En revisión; un agente contactará contigo.
                        </p>
                      )}
                      {r.status === "MANAGED" && (
                        <p className="mt-1.5 text-[11px] text-[var(--foreground)] opacity-80 leading-snug">
                          En gestión; te mantendremos informado.
                        </p>
                      )}
                      {r.status === "REJECTED" && (
                        <p className="mt-1.5 text-[11px] text-[var(--foreground)] opacity-80 leading-snug">
                          Cerrada. Más información: contacto en la web.
                        </p>
                      )}
                    </div>
                  ))}

                  {resolved.company && resolved.published && (
                    <div className="pt-1">
                      <CompanyCard
                        company={resolved.company}
                        isLoggedIn
                        linkToFicha
                        compact
                        ctaLabel="Ver ficha"
                      />
                    </div>
                  )}

                  {!resolved.published && resolved.fallbackName && latestInfo && (
                    <p className="text-sm text-[var(--foreground)] opacity-80">
                      Cuando la operación esté publicada, podrás abrir la ficha desde el catálogo.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center pb-4">
        <Link
          href="/companies"
          className="rounded-lg px-4 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white shadow-sm hover:opacity-95 transition"
        >
          Explorar más empresas
        </Link>
        <Link
          href="/dashboard/buyer"
          className="rounded-lg px-4 py-2 text-xs font-semibold border border-[var(--brand-primary)]/35 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/5 transition"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
