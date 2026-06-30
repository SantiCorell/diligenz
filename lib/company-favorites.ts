import { prisma } from "@/lib/prisma";
import { resolveCompanyForBuyerInterest } from "@/lib/buyer-company-resolve";
import type { CompanyMock } from "@/lib/mock-companies";

export async function getUserFavoriteCompanyIds(userId: string): Promise<string[]> {
  const rows = await prisma.userCompanyInterest.findMany({
    where: { userId, type: "FAVORITE" },
    orderBy: { createdAt: "desc" },
    select: { companyId: true },
  });
  return rows.map((row) => row.companyId);
}

export async function countCompanyFavorites(companyId: string): Promise<number> {
  return prisma.userCompanyInterest.count({
    where: { companyId, type: "FAVORITE" },
  });
}

export async function getFavoriteCountsByCompanyIds(
  companyIds: string[]
): Promise<Record<string, number>> {
  if (companyIds.length === 0) return {};

  const grouped = await prisma.userCompanyInterest.groupBy({
    by: ["companyId"],
    where: { companyId: { in: companyIds }, type: "FAVORITE" },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of grouped) {
    counts[row.companyId] = row._count._all;
  }
  return counts;
}

export type UserFavoriteRow = {
  companyId: string;
  name: string;
  published: boolean;
  savedAt: Date;
  company: CompanyMock | null;
};

export async function getUserFavoritesDetailed(userId: string): Promise<UserFavoriteRow[]> {
  const rows = await prisma.userCompanyInterest.findMany({
    where: { userId, type: "FAVORITE" },
    orderBy: { createdAt: "desc" },
    select: { companyId: true, createdAt: true },
  });

  const resolved = await Promise.all(
    rows.map(async (row) => {
      const info = await resolveCompanyForBuyerInterest(row.companyId);
      return {
        companyId: row.companyId,
        name: info.company?.name ?? info.fallbackName ?? row.companyId,
        published: info.published,
        savedAt: row.createdAt,
        company: info.company,
      };
    })
  );

  return resolved;
}

export type CompanyFavoriteUserRow = {
  userId: string;
  email: string;
  name: string | null;
  savedAt: Date;
};

export async function getCompanyFavoritesDetailed(
  companyId: string
): Promise<CompanyFavoriteUserRow[]> {
  const rows = await prisma.userCompanyInterest.findMany({
    where: { companyId, type: "FAVORITE" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true, deletedAt: true },
      },
    },
  });

  return rows
    .filter((row) => !row.user.deletedAt)
    .map((row) => ({
      userId: row.user.id,
      email: row.user.email,
      name: row.user.name,
      savedAt: row.createdAt,
    }));
}
