import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_COMPANIES } from "@/lib/mock-companies";
import { getSessionWithUser } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") as "PENDING" | "MANAGED" | "REJECTED" | null;

  const interests = await prisma.userCompanyInterest.findMany({
    where: {
      type: "REQUEST_INFO",
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const companyIds = [...new Set(interests.map((i) => i.companyId))];
  const realCompanies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true },
  });
  const companyById = new Map(realCompanies.map((c) => [c.id, c.name]));
  const mockById = new Map(MOCK_COMPANIES.map((c) => [c.id, c.name]));

  const list = interests.map((i) => ({
    id: i.id,
    userEmail: i.user.email,
    companyId: i.companyId,
    companyName: companyById.get(i.companyId) ?? mockById.get(i.companyId) ?? i.companyId,
    status: i.status ?? "PENDING",
    createdAt: i.createdAt,
  }));

  return NextResponse.json({ actions: list });
}
