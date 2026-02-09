import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    <main className="min-h-screen bg-gray-50 px-8 py-12">
      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          {company.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {company.sector} · {company.location}
        </p>
      </header>

      {/* ===================== */}
      {/* INFORMACIÓN GENERAL */}
      {/* ===================== */}
      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Información general
        </h2>

        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          {company.description || "Sin descripción"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Ingresos:</strong> {company.revenue}</p>
          <p><strong>EBITDA:</strong> {company.ebitda || "-"}</p>
          <p><strong>GMV:</strong> {company.gmv || "-"}</p>
          <p><strong>Empleados:</strong> {company.employees || "-"}</p>
          <p><strong>Propietario:</strong> {company.owner.email}</p>

          <p>
            <strong>Estado:</strong>{" "}
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs">
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

      {/* ===================== */}
      {/* EDITAR FICHA PÚBLICA */}
      {/* ===================== */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Editar ficha pública (listado y detalle)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Descripción breve en listados. Descripción del vendedor y enlaces a Drive solo visibles para usuarios registrados.
        </p>
        <form action="/api/admin/company/update" method="POST" className="mt-4 space-y-4">
          <input type="hidden" name="companyId" value={company.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre empresa</label>
            <input
              type="text"
              name="name"
              defaultValue={company.name}
              className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción breve (tarjetas y listado)</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={company.description ?? ""}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Resumen atractivo para las tarjetas del listado. Cuanto más completa, mejor."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción del vendedor (solo usuarios registrados)</label>
            <textarea
              name="sellerDescription"
              rows={8}
              defaultValue={company.sellerDescription ?? ""}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Descripción amplia: historia, fortalezas, motivo de venta, oportunidades. Solo visible en la ficha para usuarios registrados."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Enlaces a documentación (Drive, etc.)</label>
            <p className="mt-0.5 text-xs text-gray-500">Una línea por enlace: Etiqueta|URL</p>
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900"
              placeholder="Memoria comercial|https://drive.google.com/...&#10;Cuentas anuales|https://drive.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GMV (volumen de negocio)</label>
            <input
              type="text"
              name="gmv"
              defaultValue={company.gmv ?? ""}
              className="mt-1 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="ej. 2,5M €"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Guardar cambios en la ficha
          </button>
        </form>
      </section>

      {/* ===================== */}
      {/* DOCUMENTOS SUBIDOS POR EL VENDEDOR */}
      {/* ===================== */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Documentos subidos por el vendedor
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Solo visibles para ti (admin) y el dueño de la empresa. El cliente los sube desde la ficha pública.
        </p>
        {company.companyFiles.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            Aún no hay documentos subidos.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {company.companyFiles.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm"
              >
                <span className="text-gray-700">{f.name}</span>
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

      {/* ===================== */}
      {/* DOCUMENTACIÓN (NDA, MANDATO, etc.) */}
      {/* ===================== */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Documentación legal
        </h2>

        <ul className="mt-4 space-y-3">
          {company.documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
            >
              <span className="text-gray-700">
                {doc.type === "SALES_MANDATE" && "Mandato de venta"}
                {doc.type === "NDA" && "Acuerdo de confidencialidad"}
                {doc.type === "AUTHORIZATION" && "Autorización"}
              </span>

              <span
                className={
                  doc.signed
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {doc.signed ? "✔ Firmado" : "Pendiente"}
              </span>
            </li>
          ))}
        </ul>

        {!allDocsSigned && (
          <p className="mt-4 text-xs text-yellow-700">
            ⚠️ La empresa no puede publicarse hasta que toda la documentación
            esté firmada.
          </p>
        )}
      </section>

      {/* ===================== */}
      {/* ACCIONES ADMIN */}
      {/* ===================== */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Acciones administrativas
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          <strong>Estado</strong> es solo interno (revisión, borrador, vendido). No afecta la visibilidad en el marketplace.
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
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none"
          >
            <option value="DRAFT">Borrador</option>
            <option value="IN_PROCESS">En revisión</option>
            <option value="PUBLISHED">Publicado (interno)</option>
            <option value="SOLD">Vendido</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Actualizar estado
          </button>
        </form>

        {/* Visible en marketplace: solo con acción explícita */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Visible en marketplace</h3>
          {deal ? (
            deal.published ? (
              <p className="mt-2 text-sm text-green-700">
                ✔ Esta empresa ya está publicada y visible en el listado público.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  La empresa no aparece en Empresas en venta hasta que la publiques aquí.
                </p>
                <form action="/api/admin/company/publish-deal" method="POST" className="mt-3">
                  <input type="hidden" name="companyId" value={company.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                  >
                    Publicar en marketplace
                  </button>
                </form>
              </>
            )
          ) : (
            <p className="mt-2 text-sm text-gray-500">Sin deal asociado aún.</p>
          )}
        </div>

        {!allDocsSigned && (
          <p className="mt-4 text-xs text-orange-600">
            ⚠️ La empresa no tiene toda la documentación firmada. Publicar en marketplace es bajo tu responsabilidad.
          </p>
        )}
      </section>
    </main>
  );
}
