import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import CompanyImagesEditor from "@/components/companies/CompanyImagesEditor";

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
      valuations: { orderBy: { createdAt: "desc" }, take: 1 },
      deals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!company || company.ownerId !== session.userId) {
    redirect("/dashboard/seller");
  }
  if (company.removedAt) {
    redirect("/dashboard/seller");
  }

  const valuation = company.valuations[0];
  const deal = company.deals[0] ?? null;
  const published = deal?.published === true;
  const readOnlyListing = published;

  return (
    <main className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/seller"
        className="text-sm font-medium text-[var(--brand-primary)] hover:underline opacity-90"
      >
        ← Volver a mis empresas
      </Link>

      <h1 className="mt-6 text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
        {readOnlyListing ? "Ficha publicada" : "Editar"}: {company.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
        {readOnlyListing
          ? "Este proyecto está en el marketplace. Los datos del anuncio, la valoración y las imágenes los gestiona solo el equipo Diligenz. Puedes dejar un comentario sobre documentación más abajo."
          : "Ajusta la valoración orientativa, el precio de venta y las imágenes antes de la publicación. Tras publicar, los cambios los hace el administrador."}
      </p>

      {sp.success === "valuation" && (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Valoración y precio de venta guardados.
        </p>
      )}
      {sp.success === "note" && (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Comentario sobre documentación guardado.
        </p>
      )}
      {sp.error === "valuation" && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Revisa los importes (valoración obligatoria; precio de venta opcional pero coherente).
        </p>
      )}
      {sp.error === "published_readonly" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No se puede guardar: el proyecto ya está publicado. Escribe a Diligenz si necesitas un
          ajuste.
        </p>
      )}

      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Valoración y precio de venta (€)
        </h2>
        {readOnlyListing ? (
          <div className="mt-4 space-y-2 text-sm text-[var(--foreground)]">
            {valuation ? (
              <>
                <p>
                  <span className="font-semibold text-[var(--brand-primary)]">Valoración: </span>
                  {valuation.minValue.toLocaleString("es-ES")} € –{" "}
                  {valuation.maxValue.toLocaleString("es-ES")} €
                </p>
                {(valuation.salePriceMin != null || valuation.salePriceMax != null) && (
                  <p>
                    <span className="font-semibold text-[var(--brand-primary)]">
                      Precio de venta:{" "}
                    </span>
                    {valuation.salePriceMin != null &&
                    valuation.salePriceMax != null &&
                    valuation.salePriceMin === valuation.salePriceMax
                      ? `${valuation.salePriceMin.toLocaleString("es-ES")} €`
                      : `${(valuation.salePriceMin ?? valuation.salePriceMax)!.toLocaleString("es-ES")} € – ${(valuation.salePriceMax ?? valuation.salePriceMin)!.toLocaleString("es-ES")} €`}
                  </p>
                )}
              </>
            ) : (
              <p className="opacity-80">Sin valoración registrada.</p>
            )}
          </div>
        ) : (
          <form
            action={`/api/companies/${company.id}/valuation`}
            method="POST"
            className="mt-4 flex flex-wrap items-end gap-4"
          >
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Valoración mín. (€)
              </label>
              <input
                type="text"
                name="minValue"
                required
                defaultValue={valuation?.minValue ?? ""}
                className="mt-2 w-40 rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Valoración máx. (€)
              </label>
              <input
                type="text"
                name="maxValue"
                required
                defaultValue={valuation?.maxValue ?? ""}
                className="mt-2 w-40 rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Precio venta mín. (€)
              </label>
              <input
                type="text"
                name="salePriceMin"
                defaultValue={valuation?.salePriceMin ?? ""}
                className="mt-2 w-40 rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Precio venta máx. (€)
              </label>
              <input
                type="text"
                name="salePriceMax"
                defaultValue={valuation?.salePriceMax ?? ""}
                className="mt-2 w-40 rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                placeholder="Opcional"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Guardar
            </button>
          </form>
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Imágenes (portada y galería)
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          {readOnlyListing
            ? "Vista de las imágenes actuales del anuncio público."
            : "Sube fotos del negocio. La portada es la primera; puedes cambiarla con «Portada»."}
        </p>
        <CompanyImagesEditor companyId={company.id} readOnly={readOnlyListing} />
      </section>

      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Comentarios sobre documentación
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          Texto libre para indicar aclaraciones, enlaces adicionales o contexto para el equipo
          (máx. 8000 caracteres). Lo verás tú y Diligenz.
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
            placeholder="Ej.: Documentación adicional en carpeta compartida, pendiente de subir el mandato revisado…"
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
        <div className="mt-8">
          <Link
            href={`/companies/${company.id}`}
            className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver ficha pública del proyecto →
          </Link>
        </div>
      )}
    </main>
  );
}
