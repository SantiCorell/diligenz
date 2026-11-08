import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  displaySalePrice,
  entityTypeLabel,
  formatCompanyMoney,
} from "@/lib/company-display";
import { formatCompactEuroRange } from "@/lib/format-financial";
import { companiesDashboardPath } from "@/lib/companies-dashboard-path";
import { getSessionWithUser } from "@/lib/session";
import { publicListingName } from "@/lib/company-display-names";
import { resolveBuyerDocuments } from "@/lib/buyer-documents";
import { ccaaLabel } from "@/lib/spain-ccaa";

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900">{children}</div>
    </div>
  );
}

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
      companyFiles: {
        where: { kind: "image" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true },
      },
    },
  });
  if (!company || company.ownerId !== session.userId) {
    redirect(companiesDashboardPath(session.user.role));
  }
  if (company.removedAt) {
    redirect(companiesDashboardPath(session.user.role));
  }

  const dashboardBack = companiesDashboardPath(session.user.role);
  const valuation = company.valuations[0] ?? null;
  const deal = company.deals[0] ?? null;
  const published = deal?.published === true;
  const webName = publicListingName(deal?.title, company.name);
  const salePriceLabel = displaySalePrice(valuation);
  const teasers = resolveBuyerDocuments(company.buyerDocuments, company.buyerTeaserUrl);
  const website = company.website?.trim()
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;
  const statusLabel = published
    ? "Publicado"
    : company.status === "IN_PROCESS"
      ? "En revisión"
      : company.status === "SOLD"
        ? "Vendida"
        : "Borrador";
  const statusDetail = published
    ? "visible en la web para compradores verificados."
    : "pendiente de que el equipo de Diligenz complete la validación.";
  const reference = company.reference?.trim()
    ? company.reference.startsWith("#")
      ? company.reference
      : `# ${company.reference}`
    : null;

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href={dashboardBack}
          className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          ← Volver a mis empresas
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">
            Ficha de empresa
          </p>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            {statusLabel}
          </span>
          {reference ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-500">
              {reference}
            </span>
          ) : null}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{company.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Consulta el resumen de tu proyecto y los documentos que haya preparado tu gestor. La
          valoración y el precio de venta los fija el equipo de Diligenz.
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

      {company.companyFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {company.companyFiles.map((image, index) => (
            <a
              key={image.id}
              href={`/api/companies/${company.id}/files/${image.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={
                index === 0
                  ? "col-span-2 overflow-hidden rounded-3xl sm:col-span-3"
                  : "overflow-hidden rounded-2xl"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/companies/${company.id}/files/${image.id}`}
                alt={image.name || company.name}
                className={
                  index === 0
                    ? "h-56 w-full object-cover sm:h-72"
                    : "h-36 w-full object-cover sm:h-40"
                }
              />
            </a>
          ))}
        </div>
      )}

      <Section title="Resumen">
        <div className="space-y-4 text-sm leading-relaxed text-slate-700">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Descripción pública
            </p>
            <p className="mt-1 whitespace-pre-wrap">
              {company.description?.trim() || "Todavía no hay una descripción pública."}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Descripción interna
            </p>
            <p className="mt-1 whitespace-pre-wrap">
              {company.sellerDescription?.trim() || "Todavía no hay una descripción interna."}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Identidad">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre empresa">{company.name}</Field>
          <Field label="Nombre ficha (web)">{webName}</Field>
          <Field label="Sector">{company.sector}</Field>
          <Field label="CNAE">{company.cnae?.trim() || "—"}</Field>
          <Field label="Ubicación">{ccaaLabel(company.location)}</Field>
          <Field label="Tipo de entidad">{entityTypeLabel(company.companyType)}</Field>
          <Field label="Años operando">{company.yearsOperating ?? "—"}</Field>
          <Field label="Web">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] hover:underline">
                {company.website}
              </a>
            ) : (
              "—"
            )}
          </Field>
        </div>
      </Section>

      <Section title="Cifras económicas">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Facturación anual">{formatCompanyMoney(company.gmv ?? company.revenue)}</Field>
          <Field label="EBITDA">{formatCompanyMoney(company.ebitda)}</Field>
          <Field label="Resultado del ejercicio">{formatCompanyMoney(company.exerciseResult)}</Field>
          <Field label="Empleados">{company.employees ?? "—"}</Field>
        </div>
      </Section>

      <Section title="Valoración y precio de venta">
        <div id="valoracion" className="scroll-mt-24">
          <p className="text-sm leading-relaxed text-slate-600">
            La valoración orientativa y el precio de venta los establece el equipo de Diligenz. Si
            necesitas un ajuste, contáctanos.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f6f3ff] px-4 py-4">
            <Field label="Valoración">
              {valuation ? formatCompactEuroRange(valuation.minValue, valuation.maxValue) : "—"}
            </Field>
            <Field label="Precio de venta">{salePriceLabel ?? "Pendiente"}</Field>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            Estado del expediente: <span className="font-semibold text-slate-900">{statusLabel}</span>
            <span> — {statusDetail}</span>
          </p>
        </div>
      </Section>

      <Section title="Teaser de venta">
        <p className="text-sm leading-relaxed text-slate-600">
          Así es como los compradores verificados ven tu empresa una vez publicada. Lo prepara tu
          gestor a partir de los datos de esta ficha — revísalo y avísale si algo no es correcto.
        </p>
        {teasers.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {teasers.map((doc) => (
              <li
                key={doc.url}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-400">
                    <FileText className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{doc.label}</p>
                    <p className="text-xs text-slate-500">Documento confidencial, uso interno</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
                  >
                    Ver teaser
                  </a>
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                    aria-label={`Descargar ${doc.label}`}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            El teaser aparecerá aquí cuando esté subido, para verlo o descargarlo.
          </p>
        )}
      </Section>

      <Section title="Documentos">
        <p className="text-sm leading-relaxed text-slate-600">
          Cada enlace es un documento que ha dejado tu gestor. Se abre en una pestaña nueva.
        </p>
        {teasers.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {teasers.map((doc) => (
              <li
                key={doc.url}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f6f3ff] text-[#7c4dff]">
                    <FileText className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="truncate text-sm font-semibold text-slate-900">{doc.label}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
                >
                  Abrir documento
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Todavía no hay documentos. Aparecerán aquí cuando tu gestor añada los enlaces.
          </p>
        )}
      </Section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">
          Comentarios sobre documentación
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Tu gestor asignado puede ver estos comentarios. Máx. 8000 caracteres.
        </p>
        <form
          action={`/api/companies/${company.id}/seller-documents-note`}
          method="POST"
          className="mt-4 space-y-3"
        >
          <textarea
            name="note"
            rows={4}
            maxLength={8000}
            defaultValue={company.sellerDocumentsNote ?? ""}
            placeholder="Ej.: Falta el balance del último ejercicio, o el teaser no refleja el nombre comercial…"
            className="min-h-[96px] w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-[var(--brand-primary)] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Guardar comentario
          </button>
        </form>
      </section>
    </main>
  );
}
