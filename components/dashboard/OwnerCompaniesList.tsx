import { prisma } from "@/lib/prisma";
import { SELL_DASHBOARD_PATH } from "@/lib/companies-dashboard-path";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import DeleteCompanyButton from "@/components/companies/DeleteCompanyButton";
import { displaySalePrice } from "@/lib/company-display";
import { formatCompactEuroRange } from "@/lib/format-financial";
import { buildOwnerCompanyCardInfo } from "@/components/dashboard/OwnerCompanyCardMeta";
import { ccaaLabel } from "@/lib/spain-ccaa";

export function OwnerCompaniesListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="min-h-[320px] animate-pulse rounded-[1.75rem] border border-[var(--brand-primary)]/10 bg-white p-6"
        >
          <div className="h-5 w-24 rounded-full bg-[var(--brand-primary)]/10" />
          <div className="mt-6 h-4 w-32 rounded bg-[var(--brand-primary)]/10" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-12 rounded bg-[var(--brand-primary)]/5" />
            <div className="h-12 rounded bg-[var(--brand-primary)]/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

type Props = {
  userId: string;
  dashboardPath: string;
};

function listingStatus(company: {
  status: string;
  deals: { published: boolean }[];
}) {
  const published = company.deals[0]?.published === true;
  if (published) return { label: "Publicado", className: "bg-emerald-100 text-emerald-800" };
  if (company.status === "IN_PROCESS") {
    return { label: "En revisión", className: "bg-amber-100 text-amber-900" };
  }
  if (company.status === "SOLD") return { label: "Vendida", className: "bg-slate-100 text-slate-600" };
  return { label: "Borrador", className: "bg-amber-100 text-amber-900" };
}

export async function OwnerCompaniesList({ userId, dashboardPath }: Props) {
  const companies = await prisma.company.findMany({
    where: { ownerId: userId, removedAt: null },
    include: {
      deals: { orderBy: { createdAt: "desc" }, take: 1 },
      valuations: { orderBy: { createdAt: "desc" }, take: 1 },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (companies.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-[var(--brand-primary)]/10 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--brand-primary)] sm:text-2xl">
          Aún no has añadido ninguna empresa
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90 sm:text-base">
          Empieza subiendo tu empresa y recibe un rango orientativo en minutos.
        </p>
        <Link
          href={SELL_DASHBOARD_PATH}
          className="mt-6 inline-block rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
        >
          Subir mi empresa
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
      {companies.map((company) => {
        const deal = company.deals[0] ?? null;
        const valuation = company.valuations[0] ?? null;
        const published = deal?.published === true;
        const allDocsSigned =
          company.documents.length > 0 && company.documents.every((d) => d.signed);
        const cardInfo = buildOwnerCompanyCardInfo(company);
        const status = listingStatus(company);
        const detailHref = `/dashboard/seller/companies/${company.id}`;
        const uploaded = company.createdAt.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const reference = cardInfo.reference
          ? cardInfo.reference.startsWith("#")
            ? cardInfo.reference
            : `# ${cardInfo.reference}`
          : null;
        const valuationLabel = valuation
          ? formatCompactEuroRange(valuation.minValue, valuation.maxValue)
          : "—";
        const saleLabel = displaySalePrice(valuation) ?? "—";

        return (
          <article
            key={company.id}
            className="relative flex h-full flex-col rounded-[1.75rem] border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
          >
            <Link
              href={detailHref}
              className="absolute inset-0 z-0 rounded-[1.75rem]"
              aria-label={`Ver ficha de ${company.name}`}
            />
            <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
                <span className="text-xs text-slate-400">Subida el {uploaded}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                {reference ? (
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
                    {reference}
                  </span>
                ) : (
                  <span />
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-red-400" aria-hidden />
                  {ccaaLabel(company.location)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Nombre real
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug text-slate-900">{cardInfo.realName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Nombre ficha (web)
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-slate-800">{cardInfo.webName}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f6f3ff] px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Valoración
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{valuationLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Precio de venta
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{saleLabel}</p>
                </div>
              </div>

              {!published && (
                <p className="mt-4 rounded-2xl bg-[#f6f3ff] px-4 py-3 text-xs leading-relaxed text-slate-600">
                  {allDocsSigned
                    ? "Documentación completa. El equipo de Diligenz está revisando el proyecto. Una vez aprobado, se publicará de forma anónima para compradores verificados."
                    : "Este proyecto no se publicará hasta que toda la documentación esté firmada. Una vez aprobado, se publicará de forma anónima para compradores verificados."}
                </p>
              )}

              <div className="pointer-events-auto mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-[var(--brand-primary)]">
                <Link href={`${detailHref}#valoracion`} className="hover:underline">
                  Gestionar valoración y precio
                </Link>
                <a
                  href={`/companies/${company.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Ver anuncio web
                </a>
                <DeleteCompanyButton
                  companyId={company.id}
                  companyName={company.name}
                  redirectTo={dashboardPath}
                  variant="text"
                />
              </div>

              <Link
                href={detailHref}
                className="pointer-events-auto mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Ver ficha completa →
              </Link>
            </div>
          </article>
        );
      })}

      <Link
        href={SELL_DASHBOARD_PATH}
        className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-slate-500 transition hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Plus className="h-6 w-6" aria-hidden />
        </span>
        <span className="mt-4 text-base font-semibold text-slate-800">Sube otra empresa</span>
        <span className="mt-2 max-w-xs text-sm leading-relaxed">
          Obtén una valoración orientativa en minutos y da de alta un nuevo proyecto de venta.
        </span>
        <span className="mt-5 rounded-full border border-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-[var(--brand-primary)]">
          Subir empresa
        </span>
      </Link>
    </div>
  );
}
