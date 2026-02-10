import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/session";

export default async function SellerDashboardPage() {
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/login");

  const companies = await prisma.company.findMany({
    where: { ownerId: userId },
    include: {
      deals: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      valuations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
              Panel del vendedor
            </h1>
            <p className="mt-1 text-sm sm:text-base text-[var(--foreground)] opacity-90">
              Gestiona tus proyectos de forma confidencial y profesional.
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition shrink-0"
          >
            Valorar nueva empresa
          </Link>
        </div>

        {/* Empty state */}
        {companies.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--brand-primary)]">
              Aún no has creado ningún proyecto
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
              Empieza valorando tu empresa y recibe un rango orientativo en minutos.
            </p>

            <Link
              href="/sell"
              className="mt-6 inline-block rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Valorar mi empresa
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {companies.map((company) => {
              const deal = company.deals[0] ?? null;
              const valuation = company.valuations[0] ?? null;

              const allDocsSigned =
                company.documents.length > 0 &&
                company.documents.every((d) => d.signed);

              return (
                <div
                  key={company.id}
                  className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 transition hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-[var(--brand-primary)]">
                        {deal?.title || "Proyecto confidencial"}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--foreground)] opacity-85">
                        {company.sector} · {company.location}
                      </p>

                      {valuation && (
                        <p className="mt-3 text-lg font-medium text-[var(--brand-primary)]">
                          {valuation.minValue.toLocaleString("es-ES")} € –{" "}
                          {valuation.maxValue.toLocaleString("es-ES")} €
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          deal?.published
                            ? "bg-green-100 text-green-700"
                            : company.status === "IN_PROCESS"
                            ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {deal?.published
                          ? "Publicado"
                          : company.status === "IN_PROCESS"
                          ? "En revisión"
                          : "Borrador"}
                      </span>

                      {deal && (
                        <Link
                          href={`/deals/${deal.slug}`}
                          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
                        >
                          Ver ficha del proyecto
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Footer / Legal / Actions */}
                  {!deal?.published && (
                    <div className="mt-6 space-y-4 rounded-xl bg-white border border-[var(--brand-primary)]/10 p-5 text-sm sm:text-base text-[var(--foreground)] opacity-90">
                      {!allDocsSigned ? (
                        <p className="flex items-center gap-2">
                          <span>🔒</span>
                          <span>
                            Este proyecto no se publicará hasta que toda la documentación esté firmada.
                          </span>
                        </p>
                      ) : company.status === "IN_PROCESS" ? (
                        <p className="flex items-center gap-2">
                          <span>🕒</span>
                          <span>
                            Documentación completa. El equipo de Diligenz está revisando el proyecto
                            para su publicación.
                          </span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-2">
                          <span>📄</span>
                          <span>
                            Documentación completa. Puedes solicitar la publicación del proyecto.
                          </span>
                        </p>
                      )}

                      {allDocsSigned && company.status === "DRAFT" && (
                        <form action="/api/company/request-publication" method="POST">
                          <input type="hidden" name="companyId" value={company.id} />
                          <button
                            type="submit"
                            className="mt-2 inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
                          >
                            Solicitar publicación
                          </button>
                        </form>
                      )}

                      {company.status === "IN_PROCESS" && (
                        <p className="text-xs text-[var(--foreground)] opacity-70">
                          Una vez aprobado, el proyecto se publicará de forma anónima para inversores verificados.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </main>
  );
}
