import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DEFAULT_MAX_CONCURRENT_COMPANIES = 3;

export function isUnlimitedProfessionalCompanies(role: UserRole): boolean {
  return role === "ADMIN";
}

export function getMaxConcurrentCompanies(
  role: UserRole,
  maxConcurrentCompanies: number | null | undefined
): number | null {
  if (role !== "PROFESSIONAL") return null;
  const n = maxConcurrentCompanies ?? DEFAULT_MAX_CONCURRENT_COMPANIES;
  return Math.max(1, Math.min(50, n));
}

export async function countActiveOwnerCompanies(userId: string): Promise<number> {
  return prisma.company.count({
    where: { ownerId: userId, removedAt: null },
  });
}

export async function getProfessionalCompanyQuota(user: {
  id: string;
  role: UserRole;
  maxConcurrentCompanies?: number | null;
}): Promise<{ active: number; max: number | null; canAddMore: boolean }> {
  const active = await countActiveOwnerCompanies(user.id);
  if (user.role !== "PROFESSIONAL" || isUnlimitedProfessionalCompanies(user.role)) {
    return { active, max: null, canAddMore: true };
  }
  const max = getMaxConcurrentCompanies(user.role, user.maxConcurrentCompanies);
  if (max === null) {
    return { active, max: null, canAddMore: true };
  }
  return { active, max, canAddMore: active < max };
}

export function professionalCompanyLimitMessage(max: number): string {
  if (max === DEFAULT_MAX_CONCURRENT_COMPANIES) {
    return "No puedes subir más empresas: solo puedes tener 3 proyectos activos a la vez. Si necesitas más capacidad, ponte en contacto con nosotros.";
  }
  return `No puedes subir más empresas: solo puedes tener ${max} proyectos activos a la vez. Si necesitas más capacidad, ponte en contacto con nosotros.`;
}
