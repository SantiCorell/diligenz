import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DEFAULT_MAX_CONCURRENT_INFO_REQUESTS = 4;

export function isUnlimitedInfoRequests(role: UserRole): boolean {
  return role === "ADMIN";
}

export function getMaxConcurrentInfoRequests(
  role: UserRole,
  maxConcurrentInfoRequests: number | null | undefined
): number | null {
  if (isUnlimitedInfoRequests(role)) return null;
  const n = maxConcurrentInfoRequests ?? DEFAULT_MAX_CONCURRENT_INFO_REQUESTS;
  return Math.max(1, Math.min(50, n));
}

export async function countActiveInfoRequests(userId: string): Promise<number> {
  return prisma.userCompanyInterest.count({
    where: {
      userId,
      type: "REQUEST_INFO",
      status: { in: ["PENDING", "MANAGED"] },
    },
  });
}

export async function getUserInfoRequestQuota(user: {
  id: string;
  role: UserRole;
  maxConcurrentInfoRequests?: number | null;
}): Promise<{ active: number; max: number | null; canRequestMore: boolean }> {
  const active = await countActiveInfoRequests(user.id);
  const max = getMaxConcurrentInfoRequests(user.role, user.maxConcurrentInfoRequests);
  if (max === null) {
    return { active, max: null, canRequestMore: true };
  }
  return { active, max, canRequestMore: active < max };
}

export const INFO_REQUEST_LIMIT_MESSAGE =
  "No puedes solicitar más información: solo puedes tener 4 empresas activas a la vez. Si necesitas más oportunidades, ponte en contacto con nosotros.";

export function infoRequestLimitMessage(max: number): string {
  if (max === DEFAULT_MAX_CONCURRENT_INFO_REQUESTS) {
    return INFO_REQUEST_LIMIT_MESSAGE;
  }
  return `No puedes solicitar más información: solo puedes tener ${max} empresas activas a la vez. Si necesitas más oportunidades, ponte en contacto con nosotros.`;
}
