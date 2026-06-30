import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import {
  getUserActivityStats,
  getUserInfoRequestSummaries,
} from "@/lib/user-activity";

type Params = { params: Promise<{ id: string }> };

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
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50));

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
