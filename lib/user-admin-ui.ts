import type { UserAccountStatus, UserRole } from "@prisma/client";

export const ADMIN_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  BUYER: "Comprador",
  SELLER: "Vendedor",
  PROFESSIONAL: "Profesional",
};

export const ADMIN_ACCOUNT_STATUS_LABELS: Record<UserAccountStatus, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revisión",
  ACTIVE: "Activo",
  REJECTED: "Rechazado",
};

export function accountStatusBadgeClass(s: UserAccountStatus): string {
  switch (s) {
    case "ACTIVE":
      return "bg-emerald-500/15 text-emerald-900 ring-1 ring-emerald-500/25";
    case "IN_REVIEW":
      return "bg-sky-500/15 text-sky-900 ring-1 ring-sky-500/25";
    case "PENDING":
      return "bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/25";
    case "REJECTED":
      return "bg-red-500/10 text-red-900 ring-1 ring-red-500/20";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export const ACCOUNT_STATUSES: UserAccountStatus[] = [
  "PENDING",
  "IN_REVIEW",
  "ACTIVE",
  "REJECTED",
];
