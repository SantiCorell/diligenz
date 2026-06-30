import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { backfillMissingCompanyReferencesIfNeeded, companyReferenceFieldSupported } from "@/lib/company-reference";
import AdminCreateCompanyForm from "@/components/admin/AdminCreateCompanyForm";
import DeleteCompanyButton from "@/components/companies/DeleteCompanyButton";
import { getFormSectorOptions } from "@/lib/sector-catalog";
import { isFeaturedActive, FEATURED_DURATION_MS } from "@/lib/company-ranking";
import AdminFeatureCompanyButton from "@/components/admin/AdminFeatureCompanyButton";
import AdminStatusChip from "@/components/admin/AdminStatusChip";
import { publicListingName } from "@/lib/company-display-names";
import { getFavoriteCountsByCompanyIds } from "@/lib/company-favorites";
import { formatCompactEuroRange } from "@/lib/format-financial";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    ref?: string;
    status?: string;
    docs?: string;
    marketplace?: string;
    error?: string;
    success?: string;
  }>;
}) {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const q = params.q;
  const ref = params.ref;
  const status = params.status;
  const docs = params.docs;
  const marketplaceOnly = params.marketplace === "1";

  await backfillMissingCompanyReferencesIfNeeded();

  const refField = companyReferenceFieldSupported();

  const [companies, sectorOptions] = await Promise.all([
    prisma.company.findMany({
      where: {
        removedAt: null,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                ...(refField
                  ? [{ reference: { contains: q, mode: "insensitive" as const } }]
                  : []),
              ],
            }
          : {}),
        ...(ref && refField ? { reference: { contains: ref.trim(), mode: "insensitive" } } : {}),
        ...(status ? { status: status as "DRAFT" | "IN_PROCESS" | "PUBLISHED" | "SOLD" } : {}),
        ...(marketplaceOnly ? { deals: { some: { published: true } } } : {}),
      },
      include: {
        owner: true,
        documents: true,
        deals: true,
        valuations: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    getFormSectorOptions(),
  ]);

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

  const favoriteCounts = await getFavoriteCountsByCompanyIds(
    filteredCompanies.map((company) => company.id)
  );
  const featuredDays = Math.round(FEATURED_DURATION_MS / (24 * 60 * 60 * 1000));

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 mb-2">
          Catálogo
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Empresas
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
          Todas las empresas dadas de alta por vendedores. Entra en cada ficha para editar la información pública, cambiar el estado (borrador, en revisión, publicado) y publicar o despublicar en el marketplace.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
          Usa los filtros para buscar por nombre, referencia, estado o documentación firmada.
        </p>
      </div>

      {params.error === "create_missing" && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Completa todos los campos obligatorios para crear la empresa.
        </p>
      )}
      {params.error === "create_owner" && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          El usuario asignado no es válido o está bloqueado.
        </p>
      )}
      {params.error === "create_revenue" && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Indica una facturación anual numérica mayor que cero.
        </p>
      )}
      {params.error === "create_reference" && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Esa referencia ya está en uso. Elige otra distinta.
        </p>
      )}
      {params.success === "featured" && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Empresa destacada en listados y home durante {featuredDays} días.
        </p>
      )}
      {params.success === "unfeatured" && (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Destacado retirado.
        </p>
      )}
      <AdminCreateCompanyForm
        sectorOptions={sectorOptions}
        defaultOpen={Boolean(params.error?.startsWith("create_"))}
      />

      <form
        method="GET"
        className="admin-filter-bar mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          type="text"
          name="q"
          placeholder="Nombre o referencia…"
          defaultValue={q}
          className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none lg:col-span-2"
        />
        <input
          type="text"
          name="ref"
          placeholder="Ref. exacta (ej. DIL-2401)"
          defaultValue={ref}
          className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm font-mono focus:border-[var(--brand-primary)] focus:outline-none"
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
        <select
          name="marketplace"
          defaultValue={marketplaceOnly ? "1" : ""}
          className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
        >
          <option value="">Todas (web)</option>
          <option value="1">Solo en marketplace</option>
        </select>
        <button
          type="submit"
          className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
        >
          Filtrar
        </button>
      </form>

      <div className="space-y-4">
        {filteredCompanies.length === 0 && (
          <p className="rounded-2xl admin-list-card p-8 text-center text-sm sm:text-base text-[var(--foreground)] opacity-90">
            No hay empresas que coincidan con los filtros.
          </p>
        )}

        {filteredCompanies.map((company) => {
          const allDocsSigned =
            company.documents.length > 0 &&
            company.documents.every((d) => d.signed);
          const deal =
            company.deals.find((d) => d.published) ?? company.deals[0];
          const isOnWeb = Boolean(deal?.published);
          const featuredActive = isFeaturedActive(company.featuredAt);
          const valuation = company.valuations[0];

          return (
            <div
              key={company.id}
              className="admin-list-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)]">
                  {company.name}
                  {company.reference ? (
                    <span className="ml-2 font-mono text-xs font-bold text-[var(--brand-primary)]">
                      · {company.reference}
                    </span>
                  ) : null}
                </p>
                {deal ? (
                  <p className="mt-0.5 text-xs font-medium text-[var(--brand-primary)]">
                    Ficha: {publicListingName(deal.title, company.name)}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">
                  {company.sector} · {company.location}
                </p>
                {valuation && (
                  <p className="mt-2 text-sm font-medium text-[var(--brand-primary)]">
                    {formatCompactEuroRange(valuation.minValue, valuation.maxValue)}
                  </p>
                )}
                {(favoriteCounts[company.id] ?? 0) > 0 && (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    ♥ {favoriteCounts[company.id]} favorito
                    {favoriteCounts[company.id] === 1 ? "" : "s"}
                  </p>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <AdminStatusChip tone={allDocsSigned ? "success" : "warning"}>
                    {allDocsSigned ? "Docs OK" : "Docs pend."}
                  </AdminStatusChip>
                  <AdminStatusChip tone="primary">{company.status}</AdminStatusChip>
                  {isOnWeb && <AdminStatusChip tone="success">En la web</AdminStatusChip>}
                  {isOnWeb && featuredActive && (
                    <AdminStatusChip tone="featured">★ Destacada</AdminStatusChip>
                  )}
                </div>

                {isOnWeb ? (
                  <AdminFeatureCompanyButton
                    companyId={company.id}
                    published
                    featuredActive={featuredActive}
                    className="block w-full sm:w-auto"
                  />
                ) : (
                  <span
                    className="inline-block rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/50 px-4 py-2.5 text-center text-xs font-medium text-[var(--foreground)]/60 sm:text-right"
                    title="Publica la empresa en el marketplace para poder destacarla"
                  >
                    Destacar (publica antes)
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Link
                    href={`/admin/companies/${company.id}`}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
                  >
                    Editar / Ver
                  </Link>
                  <DeleteCompanyButton
                    companyId={company.id}
                    companyName={company.name}
                    redirectTo="/admin/companies"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
