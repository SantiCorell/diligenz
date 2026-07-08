import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import {
  getUserActivityStats,
  getUserInfoRequestSummaries,
  getUserOwnerCompanyStats,
  getUserOwnerCompanySummaries,
} from "@/lib/user-activity";

type Params = { params: Promise<{ id: string }> };

const OWNER_ACTIVITY_ROLES = new Set(["SELLER", "PROFESSIONAL"]);

export async function GET(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Usuario no indicado" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50));

  if (OWNER_ACTIVITY_ROLES.has(user.role)) {
    const [stats, companies] = await Promise.all([
      getUserOwnerCompanyStats(userId),
      getUserOwnerCompanySummaries(userId),
    ]);

    const pageCompanies = companies.slice(0, limit);
    const valuedCompanies = pageCompanies.filter((c) => c.valuationLabel);

    return NextResponse.json({
      view: "owner",
      stats,
      companies: pageCompanies.map((company) => ({
        id: company.companyId,
        companyId: company.companyId,
        realName: company.realName,
        webName: company.webName,
        reference: company.reference,
        companyStatus: company.companyStatus,
        dealPublished: company.dealPublished,
        valuationLabel: company.valuationLabel,
        createdAt: company.createdAt.toISOString(),
        valuedAt: company.valuedAt?.toISOString() ?? null,
      })),
      valuedCompanies: valuedCompanies.map((company) => ({
        id: `${company.companyId}-valued`,
        companyId: company.companyId,
        realName: company.realName,
        webName: company.webName,
        reference: company.reference,
        valuationLabel: company.valuationLabel,
        valuedAt: company.valuedAt?.toISOString() ?? company.createdAt.toISOString(),
      })),
    });
  }

  const [stats, summaries] = await Promise.all([
    getUserActivityStats(userId),
    getUserInfoRequestSummaries(userId),
  ]);

  const pageSummaries = summaries.slice(0, limit);
  const companyIds = pageSummaries.map((s) => s.companyId);
  const companies = companyIds.length
    ? await prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      })
    : [];
  const companyById = new Map(companies.map((c) => [c.id, c.name]));

  return NextResponse.json({
    view: "buyer",
    stats,
    events: pageSummaries.map((summary) => {
      const companyName = companyById.get(summary.companyId) ?? summary.companyId;
      return {
        id: `${summary.companyId}-${summary.status}`,
        interestId: summary.interestId,
        companyId: summary.companyId,
        companyName,
        status: summary.status,
        createdAt: summary.updatedAt.toISOString(),
      };
    }),
  });
}
