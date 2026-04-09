import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionWithUser } from "@/lib/session";
import UserOwnerSearch from "@/components/admin/UserOwnerSearch";
import CompanyImagesEditor from "@/components/companies/CompanyImagesEditor";
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

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      documents: true,
      deals: true,
      companyFiles: { orderBy: { createdAt: "desc" } },
      valuations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      owner: true,
      removedBy: { select: { email: true, name: true } },
    },
  });

  if (!company) redirect("/admin/companies");

  const valuation = company.valuations[0];
  const deal = company.deals[0] ?? null;

  const allDocsSigned =
    company.documents.length > 0 &&
    company.documents.every((d) => d.signed);

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabecera con contexto */}
      <div className="mb-8">
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
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          {company.sector} · {company.location}
        </p>
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
        {sp.success === "valuation" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Valoración guardada.
          </p>
        )}
        {sp.success === "docs" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Estado de documentación legal actualizado.
          </p>
        )}
        {sp.success === "deal" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Datos del deal actualizados.
          </p>
        )}
        {sp.success === "status_updated" && (
          <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Estado de la empresa actualizado.
          </p>
        )}
        {(sp.error === "valuation" ||
          sp.error === "deal" ||
          sp.error === "deal_slug" ||
          sp.error === "company_removed") && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {sp.error === "deal_slug"
              ? "Ese slug ya está en uso; elige otro."
              : sp.error === "company_removed"
              ? "Esta empresa está archivada: no se pueden guardar cambios desde el panel."
              : "Revisa los valores introducidos e inténtalo de nuevo."}
          </p>
        )}
      </div>

      {/* INFORMACIÓN GENERAL */}
      <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Información general
        </h2>

        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
          {company.description || "Sin descripción"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-[var(--foreground)] opacity-90">
          <p><strong>Facturación anual (€):</strong> {company.gmv ?? company.revenue}</p>
          <p><strong>EBITDA:</strong> {company.ebitda ?? "-"}</p>
          <p><strong>Resultado del ejercicio:</strong> {company.exerciseResult ?? "-"}</p>
          <p><strong>Empleados:</strong> {company.employees ?? "-"}</p>
          <p><strong>Tipo de entidad:</strong> {entityTypeLabel(company.companyType)}</p>
          <p><strong>Años operando:</strong> {company.yearsOperating ?? "-"}</p>
          {company.companyType === "STARTUP" && (
            <>
              <p><strong>Etapa:</strong> {company.stage ?? "-"}</p>
              <p><strong>Ha recibido financiación:</strong> {company.hasReceivedFunding === true ? "Sí" : company.hasReceivedFunding === false ? "No" : "—"}</p>
            </>
          )}
          {company.revenueGrowthPercent != null && (
            <p><strong>Crecimiento facturación anual %:</strong> {company.revenueGrowthPercent}%</p>
          )}
          {company.arr != null && <p><strong>ARR (€):</strong> {company.arr.toLocaleString("es-ES")}</p>}
          {company.takeRatePercent != null && <p><strong>Take rate (%):</strong> {company.takeRatePercent}%</p>}
          {company.breakevenExpectedYear != null && (
            <p><strong>Breakeven (año previsto):</strong> {company.breakevenExpectedYear}</p>
          )}
          <p><strong>Propietario:</strong> {company.owner.email}</p>
          {company.website && (
            <p><strong>Web:</strong>{" "}
              <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] hover:underline">
                {company.website}
              </a>
            </p>
          )}

          <p>
            <strong>Estado:</strong>{" "}
            <span className="ml-2 rounded-full bg-[var(--brand-bg-lavender)] px-2 py-1 text-xs font-medium text-[var(--brand-primary)]">
              {company.status}
            </span>
          </p>

          {valuation && (
            <p>
              <strong>Valoración orientativa:</strong>{" "}
              {valuation.minValue.toLocaleString("es-ES")} € –{" "}
              {valuation.maxValue.toLocaleString("es-ES")} €
            </p>
          )}
          {valuation &&
            (valuation.salePriceMin != null || valuation.salePriceMax != null) && (
              <p>
                <strong>Precio de venta:</strong>{" "}
                {valuation.salePriceMin != null &&
                valuation.salePriceMax != null &&
                valuation.salePriceMin === valuation.salePriceMax
                  ? `${valuation.salePriceMin.toLocaleString("es-ES")} €`
                  : `${(valuation.salePriceMin ?? valuation.salePriceMax)!.toLocaleString("es-ES")} € – ${(valuation.salePriceMax ?? valuation.salePriceMin)!.toLocaleString("es-ES")} €`}
              </p>
            )}
        </div>
      </section>

      {/* EDITAR FICHA PÚBLICA */}
      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Editar ficha pública (listado y detalle)
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Descripción breve en listados. La descripción ampliada del vendedor la ven los usuarios registrados. Los enlaces a Google Drive solo los ven el propietario de la empresa y los administradores en la ficha pública. Activa la opción inferior para permitir que usuarios registrados vean los archivos subidos y fotos (no los enlaces de Drive).
        </p>
        <form action="/api/admin/company/update" method="POST" className="mt-4 space-y-4">
          <input type="hidden" name="companyId" value={company.id} />

          <UserOwnerSearch
            initialUserId={company.ownerId}
            initialSummary={`${company.owner.name ? `${company.owner.name} · ` : ""}${company.owner.email}`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Nombre empresa</label>
              <input
                type="text"
                name="name"
                defaultValue={company.name}
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Sector</label>
              <input
                type="text"
                name="sector"
                defaultValue={company.sector}
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Ubicación</label>
              <input
                type="text"
                name="location"
                defaultValue={company.location}
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
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Enlaces a Google Drive (solo propietario y administradores)
            </label>
            <p className="mt-0.5 text-xs text-[var(--foreground)] opacity-70">
              Visible en la ficha pública únicamente para el vendedor titular y el equipo admin. Una línea por enlace: Etiqueta|URL
            </p>
            <textarea
              name="documentLinks"
              rows={4}
              defaultValue={
                Array.isArray(company.documentLinks)
                  ? (company.documentLinks as { label: string; url: string }[])
                      .map((l) => `${l.label}|${l.url}`)
                      .join("\n")
                  : ""
              }
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Memoria comercial|https://drive.google.com/..."
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

          <div className="flex items-center gap-3 rounded-xl bg-[var(--brand-bg-lavender)]/50 border border-[var(--brand-primary)]/10 p-4">
            <input
              type="checkbox"
              name="attachmentsApproved"
              id="attachmentsApproved"
              defaultChecked={company.attachmentsApproved}
              className="h-4 w-4 rounded border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
            />
            <label htmlFor="attachmentsApproved" className="text-sm font-medium text-[var(--foreground)]">
              Permitir que usuarios registrados vean documentación, enlaces y fotos subidas
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

      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
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
            Guardar valoración y precio
          </button>
        </form>
      </section>

      {deal && (
        <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Deal (marketplace)</h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
            Título y slug del anuncio interno. El slug debe ser único (solo letras minúsculas, números y guiones).
          </p>
          <form action="/api/admin/deal/update" method="POST" className="mt-4 space-y-4 max-w-xl">
            <input type="hidden" name="companyId" value={company.id} />
            <input type="hidden" name="dealId" value={deal.id} />
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Título</label>
              <input
                type="text"
                name="title"
                required
                defaultValue={deal.title}
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                defaultValue={deal.slug}
                className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Guardar deal
            </button>
          </form>
        </section>
      )}

      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Imágenes del anuncio (portada y galería)
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          La primera imagen es la portada en listado y cabecera de la ficha. Las demás aparecen como galería. Las imágenes son visibles públicamente solo cuando el deal está publicado en el marketplace.
        </p>
        <CompanyImagesEditor companyId={company.id} />
      </section>

      {company.sellerDocumentsNote?.trim() && (
        <section className="mt-8 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-md p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Comentario del vendedor (documentación)
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
            {company.sellerDocumentsNote}
          </p>
        </section>
      )}

      {/* DOCUMENTOS SUBIDOS POR EL VENDEDOR */}
      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentos subidos por el vendedor
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          El vendedor los sube desde la ficha pública. Si activas &quot;Permitir que usuarios registrados vean documentación, enlaces y fotos&quot; arriba, cualquier usuario logueado podrá ver y descargar estos archivos.
        </p>
        {company.companyFiles.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--foreground)] opacity-70">
            Aún no hay documentos subidos.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {company.companyFiles.map((f) => (
              <li
                key={f.id}
              className="flex items-center justify-between rounded-xl border border-[var(--brand-primary)]/10 px-4 py-3 text-sm"
            >
                <span className="text-[var(--foreground)]">{f.name}</span>
                <a
                  href={`/api/companies/${company.id}/files/${f.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand-primary)] font-medium hover:underline"
                >
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DOCUMENTACIÓN LEGAL */}
      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
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
      <section className="mt-8 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Acciones administrativas
        </h2>

        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          <strong>Estado</strong> es interno (borrador, en revisión, publicado, vendido). No determina la visibilidad en la web: para que la empresa aparezca en el listado público debes usar &quot;Publicar en marketplace&quot; más abajo.
        </p>

        <form
          action="/api/admin/company/update-status"
          method="POST"
          className="mt-4 flex flex-wrap items-center gap-3"
        >
          <input type="hidden" name="companyId" value={company.id} />

          <select
            name="status"
            defaultValue={company.status}
            className="rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
          >
            <option value="DRAFT">Borrador</option>
            <option value="IN_PROCESS">En revisión</option>
            <option value="PUBLISHED">Publicado (interno)</option>
            <option value="SOLD">Vendido</option>
          </select>

          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--foreground)]/90 text-white shadow-lg hover:opacity-95 transition"
          >
            Actualizar estado
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/10">
          <h3 className="text-sm font-semibold text-[var(--brand-primary)]">Visible en marketplace</h3>
          {deal ? (
            deal.published ? (
              <p className="mt-2 text-sm text-green-700 font-medium">
                ✔ Esta empresa está publicada y visible en el listado público.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
                  La empresa no aparece en &quot;Empresas&quot; en la web hasta que la publiques aquí.
                </p>
                <form action="/api/admin/company/publish-deal" method="POST" className="mt-3">
                  <input type="hidden" name="companyId" value={company.id} />
                  <button
                    type="submit"
                    className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-green-600 text-white shadow-lg hover:opacity-95 transition"
                  >
                    Publicar en marketplace
                  </button>
                </form>
              </>
            )
          ) : (
            <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">Sin deal asociado aún.</p>
          )}
        </div>

        {!allDocsSigned && (
          <p className="mt-4 text-xs text-amber-700 font-medium">
            ⚠️ La empresa no tiene toda la documentación firmada. Publicar en marketplace es bajo tu responsabilidad.
          </p>
        )}
      </section>
    </main>
  );
}
