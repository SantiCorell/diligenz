import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { displaySalePrice, getCompanyDocumentsDriveUrl } from "@/lib/company-display";
import { formatCompactEuroRange } from "@/lib/format-financial";
import { companiesDashboardPath } from "@/lib/companies-dashboard-path";
import { ensureCompanyDriveFolder } from "@/lib/google-drive/company-drive";
import { getSessionWithUser } from "@/lib/session";
import CompanyInfoSummary from "@/components/companies/CompanyInfoSummary";
import CompanyDrivePanel from "@/components/companies/CompanyDrivePanel";
import { publicListingName } from "@/lib/company-display-names";

export default async function SellerCompanyEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owner: { select: { email: true, name: true } },
      valuations: { orderBy: { createdAt: "desc" }, take: 1 },
      deals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!company || company.ownerId !== session.userId) {
    redirect(companiesDashboardPath(session.user.role));
  }
  if (company.removedAt) {
    redirect(companiesDashboardPath(session.user.role));
  }

  let driveUrl = getCompanyDocumentsDriveUrl(company.documentLinks);
  if (!driveUrl) {
    driveUrl =
      (await ensureCompanyDriveFolder({
        companyId: company.id,
        ownerId: company.ownerId,
        companyName: company.name,
      })) ?? null;
  }

  const dashboardBack = companiesDashboardPath(session.user.role);
  const valuation = company.valuations[0] ?? null;
  const deal = company.deals[0] ?? null;
  const published = deal?.published === true;
  const readOnlyListing = published;
  const salePriceLabel = displaySalePrice(valuation);

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href={dashboardBack}
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline opacity-90"
        >
          ← Volver a mis empresas
        </Link>

        <h1 className="mt-6 text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          {readOnlyListing ? "Ficha publicada" : "Editar"}:{" "}
          {readOnlyListing && deal
            ? publicListingName(deal.title, company.name)
            : company.name}
        </h1>
        {readOnlyListing && deal ? (
          <p className="mt-1 text-sm text-[var(--foreground)]/75">
            Nombre interno del negocio: <span className="font-medium">{company.name}</span>
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          {readOnlyListing
            ? "Este proyecto está en el marketplace. Los datos del anuncio y la valoración los gestiona solo el equipo Diligenz."
            : "Consulta el resumen del proyecto y sube documentación a la carpeta de Drive. La valoración y el precio de venta los fija Diligenz."}
        </p>
      </div>

      {sp.success === "note" && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Comentario sobre documentación guardado.
        </p>
      )}
      {sp.error === "published_readonly" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No se puede guardar: el proyecto ya está publicado. Escribe a Diligenz si necesitas un
          ajuste.
        </p>
      )}

      <CompanyInfoSummary
        company={{
          ...company,
          listingName: deal ? publicListingName(deal.title, company.name) : null,
        }}
      />

      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Valoración y precio de venta (€)
        </h2>
        {!readOnlyListing && (
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-80">
            La valoración orientativa y el precio de venta los establece el equipo Diligenz. Si
            necesitas un ajuste, contáctanos.
          </p>
        )}
        <div className="mt-4 space-y-2 text-sm text-[var(--foreground)]">
          {valuation ? (
            <>
              <p>
                <span className="font-semibold text-[var(--brand-primary)]">Valoración: </span>
                {formatCompactEuroRange(valuation.minValue, valuation.maxValue)}
              </p>
              <p>
                <span className="font-semibold text-[var(--brand-primary)]">
                  Precio de venta:{" "}
                </span>
                {salePriceLabel ?? (
                  <span className="opacity-75">Pendiente de asignar por Diligenz</span>
                )}
              </p>
            </>
          ) : (
            <p className="opacity-80">Sin valoración registrada.</p>
          )}
        </div>
      </section>

      {readOnlyListing && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          El proyecto está publicado en la web. La ficha y la valoración solo las modifica el equipo
          Diligenz. Puedes seguir consultando la carpeta de documentos.
        </p>
      )}

      <CompanyDrivePanel
        driveUrl={driveUrl}
        description="Sube y consulta la documentación de esta empresa en su carpeta dedicada dentro de tu Drive."
      />

      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Comentarios sobre documentación
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          Texto libre para indicar aclaraciones o contexto para el equipo (máx. 8000 caracteres).
        </p>
        <form
          action={`/api/companies/${company.id}/seller-documents-note`}
          method="POST"
          className="mt-4 space-y-3"
        >
          <textarea
            name="note"
            rows={6}
            maxLength={8000}
            defaultValue={company.sellerDocumentsNote ?? ""}
            placeholder="Ej.: Documentación adicional en la carpeta de Drive, pendiente de subir el mandato revisado…"
            className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none resize-y min-h-[120px]"
          />
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Guardar comentario
          </button>
        </form>
      </section>

      {deal && (
        <Link
          href={`/companies/${company.id}`}
          className="inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          Ver ficha pública del proyecto →
        </Link>
      )}
    </main>
  );
}
