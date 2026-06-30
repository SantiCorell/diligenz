import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionWithUser } from "@/lib/session";
import UserOwnerSearch from "@/components/admin/UserOwnerSearch";
import AdminCompanyDriveSection from "@/components/admin/AdminCompanyDriveSection";
import AdminCompanyFavoritesSection from "@/components/admin/AdminCompanyFavoritesSection";
import SectorSelect from "@/components/forms/SectorSelect";
import CcaaSelect from "@/components/forms/CcaaSelect";
import { getFormSectorOptions } from "@/lib/sector-catalog";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { isFeaturedActive, FEATURED_DURATION_MS } from "@/lib/company-ranking";
import AdminFeatureCompanyButton from "@/components/admin/AdminFeatureCompanyButton";
import { publicListingName } from "@/lib/company-display-names";
import { getCompanyDocumentsDriveUrl, displaySalePrice, formatCompanyMoney } from "@/lib/company-display";
import { formatCompactEuroRange } from "@/lib/format-financial";
import { ensureCompanyDriveFolder } from "@/lib/google-drive/company-drive";
import { ensureCompanyReference } from "@/lib/company-reference";
import type { DocumentType } from "@prisma/client";

function entityTypeLabel(t: string | null | undefined) {
  if (t === "EMPRESA") return "Empresa";
  if (t === "AUTONOMO") return "Profesional / Autónomo";
  if (t === "STARTUP") return "Startup (histórico)";
  if (t === "MARKETPLACE") return "Marketplace (histórico)";
  return "—";
}

function docSigned(docs: { type: DocumentType; signed: boolean }[], type: DocumentType) {
  return docs.find((d) => d.type === type)?.signed ?? false;
}

export default async function AdminCompanyDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  const [company, sectorOptions] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        documents: true,
        deals: true,
        valuations: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        owner: true,
        removedBy: { select: { email: true, name: true } },
      },
    }),
    getFormSectorOptions(),
  ]);

  if (!company) redirect("/admin/companies");

  const companyReference = await ensureCompanyReference(company.id);

  let companyDriveUrl = getCompanyDocumentsDriveUrl(company.documentLinks);
  if (!companyDriveUrl) {
    companyDriveUrl =
      (await ensureCompanyDriveFolder({
        companyId: company.id,
        ownerId: company.ownerId,
        companyName: company.name,
      })) ?? null;
  }

  const ownerDriveUrl = company.owner.documentsDriveFolderUrl?.trim() ?? "";

  const valuation = company.valuations[0];
  const deal = company.deals[0] ?? null;
  const featuredActive = isFeaturedActive(company.featuredAt);
  const featuredDays = Math.round(FEATURED_DURATION_MS / (24 * 60 * 60 * 1000));

  const allDocsSigned =
    company.documents.length > 0 &&
    company.documents.every((d) => d.signed);

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/companies"
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline opacity-90"
        >
          ← Volver a Empresas
        </Link>
        <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 mt-4 mb-2">
          Ficha de empresa
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          {company.name}
        </h1>
        {deal ? (
          <p className="mt-1 text-sm font-medium text-[var(--brand-dark)]">
            Ficha pública:{" "}
            <span className="text-[var(--brand-primary)]">{publicListingName(deal.title, company.name)}</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--foreground)] opacity-90">
          Referencia:{" "}
          <span className="font-mono font-semibold text-[var(--brand-primary)]">{companyReference}</span>
        </p>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          {company.sector} · {ccaaLabel(company.location)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-950">
            Facturación: {formatCompanyMoney(company.revenue)}
          </span>
          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-950">
            EBITDA: {formatCompanyMoney(company.ebitda)}
          </span>
          {valuation ? (
            <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-950">
              Valoración: {formatCompactEuroRange(valuation.minValue, valuation.maxValue)}
            </span>
          ) : null}
          {valuation && displaySalePrice(valuation) ? (
            <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-950">
              Precio venta: {displaySalePrice(valuation)}
            </span>
          ) : null}
        </div>
        {company.removedAt && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Empresa archivada el{" "}
            {company.removedAt.toLocaleString("es-ES", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            {company.removedBy
              ? ` por ${company.removedBy.name?.trim() || company.removedBy.email}`
              : ""}
            . No aparece en listados públicos ni en el panel del vendedor; los datos se conservan en base de
            datos.
          </p>
        )}
        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
          En esta ficha puedes ver la información general, editar los textos y enlaces que verán los usuarios en el listado y en la página de detalle, revisar documentos subidos por el vendedor, la documentación legal y publicar o despublicar la empresa en el marketplace.
        </p>
        {sp.success === "created" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Empresa creada. Completa o revisa los datos abajo y guarda.
          </p>
        )}
        {sp.success === "company_updated" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Ficha actualizada.
          </p>
        )}
        {sp.success === "visibility" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Acceso de compradores al documento / teaser guardado.
          </p>
        )}
        {sp.success === "drive" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Enlace al documento de empresa guardado.
          </p>
        )}
        {sp.success === "valuation" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Valoración guardada.
          </p>
        )}
        {sp.success === "featured" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Empresa destacada en listados y home durante {featuredDays} días.
          </p>
        )}
        {sp.success === "unfeatured" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Destacado retirado.
          </p>
        )}
        {sp.success === "docs" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Estado de documentación legal actualizado.
          </p>
        )}
        {sp.error === "feature_not_published" && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Solo puedes destacar empresas publicadas en el marketplace.
          </p>
        )}
        {sp.success === "deal" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Datos del deal actualizados.
          </p>
        )}
        {sp.success === "status_updated" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Estado actualizado. La visibilidad en la web queda sincronizada con el estado elegido.
          </p>
        )}
        {(sp.error === "valuation" ||
          sp.error === "deal" ||
          sp.error === "deal_slug" ||
          sp.error === "reference_duplicate" ||
          sp.error === "company_removed") && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {sp.error === "deal_slug"
              ? "Ese slug ya está en uso; elige otro."
              : sp.error === "reference_duplicate"
              ? "Esa referencia ya la usa otra empresa."
              : sp.error === "company_removed"
              ? "Esta empresa está archivada: no se pueden guardar cambios desde el panel."
              : "Revisa los valores introducidos e inténtalo de nuevo."}
          </p>
        )}
      </div>

      {/* EDITAR FICHA PÚBLICA */}
      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Editar ficha pública (listado y detalle)
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Descripción breve en listados y datos visibles en la ficha pública. La descripción ampliada la ven usuarios registrados.
        </p>
        <form action="/api/admin/company/update" method="POST" className="mt-4 space-y-4">
          <input type="hidden" name="companyId" value={company.id} />

          <UserOwnerSearch
            initialUserId={company.ownerId}
            initialSummary={`${company.owner.name ? `${company.owner.name} · ` : ""}${company.owner.email}`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Nombre empresa (real)
              </label>
              <input
                type="text"
                name="name"
                defaultValue={company.name}
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[var(--foreground)]/60">
                Nombre legal o comercial real. Confidencial; no se muestra en la web.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Nombre visible en la web
              </label>
              {deal ? <input type="hidden" name="dealId" value={deal.id} /> : null}
              <input
                type="text"
                name="dealTitle"
                required={Boolean(deal)}
                defaultValue={deal?.title ?? ""}
                placeholder="Ej. Proyecto Vega VL5O"
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              <p className="mt-1 text-xs text-[var(--foreground)]/60">
                Título confidencial en tarjetas y ficha pública (ej. Proyecto Atlas XXXX).
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Sector</label>
              <SectorSelect required value={company.sector} options={sectorOptions} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Comunidad autónoma</label>
              <CcaaSelect required value={company.location} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">CNAE</label>
              <input
                type="text"
                name="cnae"
                maxLength={10}
                defaultValue={company.cnae ?? ""}
                placeholder="Ej. 6201"
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Facturación anual (€)</label>
              <input
                type="text"
                name="revenue"
                defaultValue={company.revenue}
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                placeholder="Texto o cifra mostrada en ficha"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">EBITDA</label>
              <input
                type="text"
                name="ebitda"
                defaultValue={company.ebitda ?? ""}
                className="mt-2 w-full max-w-md rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Resultado del ejercicio
              </label>
              <p className="mt-0.5 text-xs text-[var(--foreground)] opacity-70">
                Beneficio neto del último ejercicio (puede ser negativo). Texto libre o cifra en €.
              </p>
              <input
                type="text"
                name="exerciseResult"
                defaultValue={company.exerciseResult ?? ""}
                className="mt-2 w-full max-w-md rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                placeholder="ej. 125000 o -15.000 €"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Descripción breve (tarjetas y listado)</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={company.description ?? ""}
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Resumen atractivo para las tarjetas del listado. Cuanto más completa, mejor."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Descripción del vendedor (solo usuarios registrados)</label>
            <textarea
              name="sellerDescription"
              rows={8}
              defaultValue={company.sellerDescription ?? ""}
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Descripción amplia: historia, fortalezas, motivo de venta, oportunidades. Solo visible en la ficha para usuarios registrados."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Nº Empleados</label>
            <input
              type="number"
              name="employees"
              min={0}
              defaultValue={company.employees ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Ej. 25"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Tipo de entidad</label>
            <select
              name="companyType"
              defaultValue={
                company.companyType === "AUTONOMO"
                  ? "AUTONOMO"
                  : "EMPRESA"
              }
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="EMPRESA">Empresa</option>
              <option value="AUTONOMO">Profesional / Autónomo</option>
            </select>
            {(company.companyType === "STARTUP" || company.companyType === "MARKETPLACE") && (
              <p className="mt-1 text-xs text-amber-700">
                Registro anterior: {entityTypeLabel(company.companyType)}. Al guardar pasará a la opción seleccionada arriba.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Años operando</label>
            <input
              type="number"
              name="yearsOperating"
              min={0}
              defaultValue={company.yearsOperating ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Ej. 5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Crecimiento facturación anual %</label>
            <input
              type="number"
              name="revenueGrowthPercent"
              step={0.1}
              defaultValue={company.revenueGrowthPercent ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Ej. 50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Año previsto breakeven</label>
            <input
              type="number"
              name="breakevenExpectedYear"
              min={2000}
              max={2100}
              defaultValue={company.breakevenExpectedYear ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Ej. 2027"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Etapa (startups)</label>
            <select
              name="stage"
              defaultValue={company.stage ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="">—</option>
              <option value="idea">Idea / pre-producto</option>
              <option value="pre_seed">Pre-seed</option>
              <option value="seed">Seed</option>
              <option value="serie_a">Serie A</option>
              <option value="serie_b">Serie B</option>
              <option value="growth">Growth</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Take rate (%)</label>
            <input
              type="number"
              name="takeRatePercent"
              min={0}
              max={100}
              step={0.1}
              defaultValue={company.takeRatePercent ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Marketplace"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">ARR (€)</label>
            <input
              type="number"
              name="arr"
              min={0}
              defaultValue={company.arr ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Ingresos recurrentes anuales"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Página web</label>
            <input
              type="url"
              name="website"
              defaultValue={company.website ?? ""}
              className="mt-2 w-full max-w-md rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="https://www.ejemplo.com"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[var(--brand-bg-lavender)]/50 border border-[var(--brand-primary)]/10 p-4">
            <input
              type="checkbox"
              name="hasReceivedFunding"
              id="hasReceivedFunding"
              defaultChecked={company.hasReceivedFunding === true}
              className="h-4 w-4 rounded border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
            />
            <label htmlFor="hasReceivedFunding" className="text-sm font-medium text-[var(--foreground)]">
              Ha recibido financiación (startup)
            </label>
          </div>

          <button
            type="submit"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Guardar cambios en la ficha
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Valoración orientativa y precio de venta (€)
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          El rango orientativo y el precio pedido se muestran en la ficha pública cuando corresponda. Deja el precio de venta vacío si aún no lo queréis publicar.
        </p>
        <form action="/api/admin/company/valuation" method="POST" className="mt-4 flex flex-wrap items-end gap-4">
          <input type="hidden" name="companyId" value={company.id} />
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
              Precio de venta (€)
            </label>
            <input
              type="text"
              name="salePrice"
              defaultValue={
                valuation?.salePriceMin != null &&
                valuation?.salePriceMax != null &&
                valuation.salePriceMin === valuation.salePriceMax
                  ? valuation.salePriceMin
                  : valuation?.salePriceMin ?? ""
              }
              className="mt-2 w-40 rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Opcional"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Guardar valoración y precio
          </button>
        </form>
      </section>

      {company.sellerDocumentsNote?.trim() && (
        <section className="rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-md p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Comentario del vendedor (documentación)
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
            {company.sellerDocumentsNote}
          </p>
        </section>
      )}

      <AdminCompanyDriveSection
        companyId={company.id}
        ownerLabel={company.owner.name?.trim() || company.owner.email}
        companyDriveUrl={companyDriveUrl}
        ownerDriveUrl={ownerDriveUrl}
        attachmentsApproved={company.attachmentsApproved}
        buyerTeaserUrl={company.buyerTeaserUrl}
      />

      {/* DOCUMENTACIÓN LEGAL */}
      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentación legal
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Marca si cada documento está firmado. La empresa no debería publicarse en el marketplace hasta que todo esté firmado.
        </p>

        <form action="/api/admin/company/documents" method="POST" className="mt-4 space-y-4">
          <input type="hidden" name="companyId" value={company.id} />
          {(
            [
              ["SALES_MANDATE", "Mandato de venta"],
              ["NDA", "Acuerdo de confidencialidad"],
              ["AUTHORIZATION", "Autorización"],
            ] as const
          ).map(([type, label]) => (
            <label
              key={type}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--brand-primary)]/10 px-4 py-3 text-sm cursor-pointer"
            >
              <span className="text-[var(--foreground)] font-medium">{label}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[var(--foreground)] opacity-70">Firmado</span>
                <input
                  type="checkbox"
                  name={`signed_${type}`}
                  defaultChecked={docSigned(company.documents, type)}
                  className="h-4 w-4 rounded border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
                />
              </span>
            </label>
          ))}
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--foreground)]/90 text-white shadow-lg hover:opacity-95 transition"
          >
            Guardar estado de documentación
          </button>
        </form>

        {!allDocsSigned && (
          <p className="mt-4 text-xs text-amber-700 font-medium">
            ⚠️ La empresa no puede publicarse hasta que toda la documentación esté firmada.
          </p>
        )}
      </section>

      {/* ACCIONES ADMIN */}
      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Estado y publicación
        </h2>

        {deal?.published ? (
          <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 font-medium">
            ✔ Publicada en el marketplace — visible en &quot;Empresas&quot; en la web.
          </p>
        ) : (
          <p className="mt-3 rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/40 px-4 py-3 text-sm text-[var(--foreground)]">
            No visible en la web. Elige <strong>Publicado en web</strong> o usa el botón de publicación
            rápida.
          </p>
        )}

        <form
          action="/api/admin/company/update-status"
          method="POST"
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="companyId" value={company.id} />
          <div>
            <label htmlFor="company-status" className="block text-xs font-semibold text-[var(--brand-primary)] mb-1.5">
              Estado operativo
            </label>
            <select
              id="company-status"
              name="status"
              defaultValue={company.status}
              className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none min-w-[220px]"
            >
              <option value="DRAFT">Borrador — no visible</option>
              <option value="IN_PROCESS">En revisión — no visible</option>
              <option value="PUBLISHED">Publicado en web</option>
              <option value="SOLD">Vendido — fuera del listado</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--foreground)]/90 text-white shadow-lg hover:opacity-95 transition"
          >
            Guardar estado
          </button>
        </form>

        {deal && !deal.published ? (
          <form action="/api/admin/company/publish-deal" method="POST" className="mt-4">
            <input type="hidden" name="companyId" value={company.id} />
            <button
              type="submit"
              className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-green-600 text-white shadow-lg hover:opacity-95 transition"
            >
              Publicar en marketplace
            </button>
            <p className="mt-2 text-xs text-[var(--foreground)] opacity-70">
              Atajo: publica en la web y deja el estado en &quot;Publicado en web&quot;.
            </p>
          </form>
        ) : !deal ? (
          <p className="mt-4 text-sm text-[var(--foreground)] opacity-70">
            Sin deal asociado: crea la empresa desde valoración o admin para poder publicarla.
          </p>
        ) : null}

        <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/10">
          <h3 className="text-sm font-semibold text-[var(--brand-primary)]">Destacar en listados</h3>
          {deal?.published ? (
            <>
              {featuredActive && company.featuredAt ? (
                <p className="mt-2 text-sm text-amber-800 font-medium">
                  ★ Destacada hasta{" "}
                  {new Date(
                    company.featuredAt.getTime() + FEATURED_DURATION_MS
                  ).toLocaleDateString("es-ES", { dateStyle: "long" })}
                  . Aparece primero en el marketplace y en la home.
                </p>
              ) : (
                <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
                  Las empresas se ordenan por EBITDA. Al destacar, esta pasa a la primera posición
                  durante {featuredDays} días; después se quita sola.
                </p>
              )}
              <AdminFeatureCompanyButton
                companyId={company.id}
                published={Boolean(deal?.published)}
                featuredActive={featuredActive}
                returnTo={`/admin/companies/${company.id}`}
                className="mt-3"
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
              Publica la empresa en el marketplace para poder destacarla.
            </p>
          )}
        </div>

        {!allDocsSigned && (
          <p className="mt-4 text-xs text-amber-700 font-medium">
            ⚠️ La empresa no tiene toda la documentación firmada. Publicar en marketplace es bajo tu responsabilidad.
          </p>
        )}
      </section>

      <AdminCompanyFavoritesSection companyId={company.id} />
    </main>
  );
}
