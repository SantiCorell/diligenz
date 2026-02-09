import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; docs?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/register");

  const params = await searchParams;
  const q = params.q;
  const status = params.status;
  const docs = params.docs;

  const companies = await prisma.company.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(status ? { status: status as "DRAFT" | "IN_PROCESS" | "PUBLISHED" | "SOLD" } : {}),
    },
    include: {
      owner: true,
      documents: true,
      deals: true,
      valuations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredCompanies =
    docs === "signed"
      ? companies.filter(
          (c) =>
            c.documents.length > 0 &&
            c.documents.every((d) => d.signed)
        )
      : docs === "unsigned"
      ? companies.filter((c) => c.documents.some((d) => !d.signed))
      : companies;

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-80 mb-2">
          Catálogo
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Empresas
        </h1>
        <p className="mt-3 text-[var(--foreground)] opacity-85 leading-relaxed max-w-2xl">
          Todas las empresas dadas de alta por vendedores. Entra en cada ficha para editar la información pública, cambiar el estado (borrador, en revisión, publicado) y publicar o despublicar en el marketplace.
        </p>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
          Usa los filtros para buscar por nombre, estado o documentación firmada.
        </p>
      </div>

      <form
        method="GET"
        className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-5 shadow-lg sm:grid-cols-4"
      >
        <input
          type="text"
          name="q"
          placeholder="Buscar por nombre…"
          defaultValue={q}
          className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
        >
          <option value="">Estado</option>
          <option value="DRAFT">Borrador</option>
          <option value="IN_PROCESS">En revisión</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="SOLD">Vendido</option>
        </select>
        <select
          name="docs"
          defaultValue={docs}
          className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
        >
          <option value="">Documentación</option>
          <option value="signed">Docs completos</option>
          <option value="unsigned">Docs incompletos</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Filtrar
        </button>
      </form>

      <div className="space-y-4">
        {filteredCompanies.length === 0 && (
          <p className="rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-8 text-center text-[var(--foreground)] opacity-80">
            No hay empresas que coincidan con los filtros.
          </p>
        )}

        {filteredCompanies.map((company) => {
          const allDocsSigned =
            company.documents.length > 0 &&
            company.documents.every((d) => d.signed);
          const deal = company.deals[0];
          const valuation = company.valuations[0];

          return (
            <div
              key={company.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg transition hover:shadow-xl"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)]">
                  {company.name}
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">
                  {company.sector} · {company.location}
                </p>
                {valuation && (
                  <p className="mt-2 text-sm font-medium text-[var(--brand-primary)]">
                    {valuation.minValue.toLocaleString("es-ES")} € –{" "}
                    {valuation.maxValue.toLocaleString("es-ES")} €
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    allDocsSigned ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {allDocsSigned ? "Docs OK" : "Docs pend."}
                </span>
                <span className="rounded-full bg-[var(--brand-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)]">
                  {company.status}
                </span>
                {deal?.published && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    En la web
                  </span>
                )}
                <Link
                  href={`/admin/companies/${company.id}`}
                  className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  Editar / Ver
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
