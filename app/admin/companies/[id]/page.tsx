import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminCompanyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/register");

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
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-80 mt-4 mb-2">
          Ficha de empresa
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          {company.name}
        </h1>
        <p className="mt-2 text-[var(--foreground)] opacity-80">
          {company.sector} · {company.location}
        </p>
        <p className="mt-3 text-[var(--foreground)] opacity-85 leading-relaxed max-w-2xl">
          En esta ficha puedes ver la información general, editar los textos y enlaces que verán los usuarios en el listado y en la página de detalle, revisar documentos subidos por el vendedor, la documentación legal y publicar o despublicar la empresa en el marketplace.
        </p>
      </div>

      {/* INFORMACIÓN GENERAL */}
      <section className="rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Información general
        </h2>

        <p className="mt-3 text-sm text-[var(--foreground)] opacity-85 leading-relaxed">
          {company.description || "Sin descripción"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-[var(--foreground)] opacity-90">
          <p><strong>Ingresos:</strong> {company.revenue}</p>
          <p><strong>EBITDA:</strong> {company.ebitda || "-"}</p>
          <p><strong>GMV:</strong> {company.gmv || "-"}</p>
          <p><strong>Empleados:</strong> {company.employees ?? "-"}</p>
          <p><strong>Propietario:</strong> {company.owner.email}</p>

          <p>
            <strong>Estado:</strong>{" "}
            <span className="ml-2 rounded-full bg-[var(--brand-bg-lavender)] px-2 py-1 text-xs font-medium text-[var(--brand-primary)]">
              {company.status}
            </span>
          </p>

          {valuation && (
            <p>
              <strong>Valoración:</strong>{" "}
              {valuation.minValue.toLocaleString("es-ES")} € –{" "}
              {valuation.maxValue.toLocaleString("es-ES")} €
            </p>
          )}
        </div>
      </section>

      {/* EDITAR FICHA PÚBLICA */}
      <section className="mt-8 rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Editar ficha pública (listado y detalle)
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-80">
          Descripción breve en listados. Descripción del vendedor y enlaces a Drive solo visibles para usuarios registrados. Activa la opción inferior para permitir que usuarios registrados vean documentación y fotos.
        </p>
        <form action="/api/admin/company/update" method="POST" className="mt-4 space-y-4">
          <input type="hidden" name="companyId" value={company.id} />

          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Nombre empresa</label>
            <input
              type="text"
              name="name"
              defaultValue={company.name}
              className="mt-2 w-full max-w-md rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
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
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Enlaces a documentación (Drive, etc.)</label>
            <p className="mt-0.5 text-xs text-[var(--foreground)] opacity-70">Una línea por enlace: Etiqueta|URL</p>
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
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">GMV (volumen de negocio)</label>
            <input
              type="text"
              name="gmv"
              defaultValue={company.gmv ?? ""}
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="ej. 2,5M €"
            />
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
            className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
          >
            Guardar cambios en la ficha
          </button>
        </form>
      </section>

      {/* DOCUMENTOS SUBIDOS POR EL VENDEDOR */}
      <section className="mt-8 rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentos subidos por el vendedor
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-80">
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
                className="flex items-center justify-between rounded-xl border-2 border-[var(--brand-primary)]/10 px-4 py-3 text-sm"
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
      <section className="mt-8 rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentación legal
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-80">
          Estado de firma de mandato, NDA y autorizaciones. La empresa no puede publicarse en el marketplace hasta que toda la documentación esté firmada.
        </p>

        <ul className="mt-4 space-y-3">
          {company.documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-xl border-2 border-[var(--brand-primary)]/10 px-4 py-3 text-sm"
            >
              <span className="text-[var(--foreground)]">
                {doc.type === "SALES_MANDATE" && "Mandato de venta"}
                {doc.type === "NDA" && "Acuerdo de confidencialidad"}
                {doc.type === "AUTHORIZATION" && "Autorización"}
              </span>

              <span
                className={
                  doc.signed
                    ? "text-green-600 font-medium"
                    : "text-amber-600 font-medium"
                }
              >
                {doc.signed ? "✔ Firmado" : "Pendiente"}
              </span>
            </li>
          ))}
        </ul>

        {!allDocsSigned && (
          <p className="mt-4 text-xs text-amber-700 font-medium">
            ⚠️ La empresa no puede publicarse hasta que toda la documentación esté firmada.
          </p>
        )}
      </section>

      {/* ACCIONES ADMIN */}
      <section className="mt-8 rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Acciones administrativas
        </h2>

        <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
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
            className="rounded-xl bg-[var(--foreground)]/90 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            Actualizar estado
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/15">
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
                    className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
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
