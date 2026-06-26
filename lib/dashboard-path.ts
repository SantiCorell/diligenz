/** Ruta principal del panel según rol de usuario. */
export function dashboardPathForRole(role: string): string {
  if (role === "SELLER") return "/dashboard/seller";
  if (role === "ADMIN") return "/admin";
  if (role === "PROFESSIONAL") return "/dashboard/professional";
  return "/dashboard/buyer";
}
