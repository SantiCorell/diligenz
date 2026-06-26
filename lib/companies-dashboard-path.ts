export const SELLER_MIS_EMPRESAS_PATH = "/dashboard/seller/mis-empresas";
export const PROFESSIONAL_MIS_EMPRESAS_PATH = "/dashboard/professional/mis-empresas";
export const PROFESSIONAL_DASHBOARD_PATH = "/dashboard/professional";

/** Ruta del listado de empresas propias según rol. */
export function companiesDashboardPath(role: string): string {
  if (role === "PROFESSIONAL") return PROFESSIONAL_MIS_EMPRESAS_PATH;
  return SELLER_MIS_EMPRESAS_PATH;
}

/** Subir empresa dentro del panel (vendedor / profesional). */
export const SELL_DASHBOARD_PATH = "/dashboard/sell";
