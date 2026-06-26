import {
  entityTypeLabel,
  formatCompanyMoney,
} from "@/lib/company-display";
import { ccaaLabel } from "@/lib/spain-ccaa";

type CompanySummary = {
  name: string;
  listingName?: string | null;
  sector: string;
  location: string;
  status: string;
  revenue: string;
  gmv?: string | null;
  ebitda?: string | null;
  exerciseResult?: string | null;
  employees?: number | null;
  companyType?: string | null;
  yearsOperating?: number | null;
  revenueGrowthPercent?: number | null;
  arr?: number | null;
  website?: string | null;
  cnae?: string | null;
  description?: string | null;
  owner?: { email: string; name?: string | null };
};

type Props = {
  company: CompanySummary;
};

export default function CompanyInfoSummary({ company }: Props) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
      <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
        Resumen de la empresa
      </h2>
      {company.description?.trim() && (
        <p className="mt-3 text-sm text-[var(--foreground)] opacity-90 leading-relaxed">
          {company.description}
        </p>
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-[var(--foreground)] opacity-90">
        <p>
          <strong>Nombre empresa:</strong> {company.name}
        </p>
        {company.listingName ? (
          <p>
            <strong>Nombre ficha (web):</strong> {company.listingName}
          </p>
        ) : (
          <p>
            <strong>Proyecto:</strong> {company.name}
          </p>
        )}
        <p>
          <strong>Sector:</strong> {company.sector}
        </p>
        {company.cnae?.trim() && (
          <p>
            <strong>CNAE:</strong> {company.cnae}
          </p>
        )}
        <p>
          <strong>Ubicación:</strong> {ccaaLabel(company.location)}
        </p>
        <p>
          <strong>Facturación anual (€):</strong>{" "}
          {formatCompanyMoney(company.gmv ?? company.revenue)}
        </p>
        <p>
          <strong>EBITDA:</strong> {formatCompanyMoney(company.ebitda)}
        </p>
        <p>
          <strong>Resultado del ejercicio:</strong>{" "}
          {formatCompanyMoney(company.exerciseResult)}
        </p>
        <p>
          <strong>Empleados:</strong> {company.employees ?? "—"}
        </p>
        <p>
          <strong>Tipo de entidad:</strong> {entityTypeLabel(company.companyType)}
        </p>
        <p>
          <strong>Años operando:</strong> {company.yearsOperating ?? "—"}
        </p>
        {company.revenueGrowthPercent != null && (
          <p>
            <strong>Crecimiento facturación anual %:</strong>{" "}
            {company.revenueGrowthPercent}%
          </p>
        )}
        {company.arr != null && (
          <p>
            <strong>ARR (€):</strong> {company.arr.toLocaleString("es-ES")} €
          </p>
        )}
        {company.owner && (
          <p>
            <strong>Propietario:</strong> {company.owner.email}
          </p>
        )}
        {company.website && (
          <p className="sm:col-span-2">
            <strong>Web:</strong>{" "}
            <a
              href={
                company.website.startsWith("http")
                  ? company.website
                  : `https://${company.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand-primary)] hover:underline"
            >
              {company.website}
            </a>
          </p>
        )}
        <p>
          <strong>Estado:</strong>{" "}
          <span className="ml-1 rounded-full bg-[var(--brand-bg-lavender)] px-2 py-0.5 text-xs font-medium text-[var(--brand-primary)]">
            {company.status}
          </span>
        </p>
      </div>
    </section>
  );
}
