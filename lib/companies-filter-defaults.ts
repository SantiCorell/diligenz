import type { CompaniesDetailFilters } from "@/components/companies/CompaniesFilters";
import { sanitizeFinancialMaxParam } from "@/lib/financial-range-options";

export const DEFAULT_COMPANIES_DETAIL_FILTERS: CompaniesDetailFilters = {
  sector: "",
  location: "",
  revenueMin: "",
  revenueMax: "",
  ebitdaMin: "",
  ebitdaMax: "",
};

export const CLEARED_COMPANIES_DETAIL_FILTERS: CompaniesDetailFilters = {
  sector: "",
  location: "",
  revenueMin: "",
  revenueMax: "",
  ebitdaMin: "",
  ebitdaMax: "",
};

type SearchParams = {
  sector?: string;
  location?: string;
  page?: string;
  revenueMin?: string;
  revenueMax?: string;
  ebitdaMin?: string;
  ebitdaMax?: string;
};

export function resolveCompaniesFiltersFromSearchParams(
  params: SearchParams
): CompaniesDetailFilters {
  const hasAnyParam = Boolean(
    params.sector ||
      params.location ||
      params.page ||
      params.revenueMin ||
      params.revenueMax ||
      params.ebitdaMin ||
      params.ebitdaMax
  );

  if (!hasAnyParam) {
    return { ...DEFAULT_COMPANIES_DETAIL_FILTERS };
  }

  return {
    sector: params.sector ?? "",
    location: params.location ?? "",
    revenueMin: params.revenueMin ?? "",
    revenueMax: sanitizeFinancialMaxParam(params.revenueMax),
    ebitdaMin: params.ebitdaMin ?? "",
    ebitdaMax: sanitizeFinancialMaxParam(params.ebitdaMax),
  };
}

export function parseFilterInt(param?: string): number | undefined {
  if (!param?.trim()) return undefined;
  const parsed = Number.parseInt(param, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
