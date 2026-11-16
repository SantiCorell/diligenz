import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { publicListingName } from "@/lib/company-display-names";
import {
  PIPELINE_STATUSES,
  normalizeRequestStatus,
  type PipelineStatus,
} from "@/lib/info-request-pipeline";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const allowed = new Set<string>([...PIPELINE_STATUSES, "PENDING", "MANAGED"]);

  const interests = await prisma.userCompanyInterest.findMany({
    where: {
      type: "REQUEST_INFO",
      ...(statusFilter && allowed.has(statusFilter)
        ? { status: statusFilter as PipelineStatus }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          ndaSigned: true,
          dniVerified: true,
        },
      },
    },
    orderBy: { statusUpdatedAt: "desc" },
  });

  const companyIds = [...new Set(interests.map((i) => i.companyId))];
  const [companies, events] = await Promise.all([
    prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: {
        id: true,
        name: true,
        reference: true,
        deals: { orderBy: { createdAt: "desc" }, take: 1, select: { title: true } },
      },
    }),
    prisma.userActivityEvent.findMany({
      where: {
        companyId: { in: companyIds },
        type: { in: ["INFO_REQUEST_CREATED", "INFO_REQUEST_STATUS_CHANGED"] },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        companyId: true,
        type: true,
        metadata: true,
        createdAt: true,
      },
    }),
  ]);

  const companyById = new Map(companies.map((c) => [c.id, c]));

  const list = interests.map((interest) => {
    const company = companyById.get(interest.companyId);
    const publicName = company
      ? publicListingName(company.deals[0]?.title, company.name)
      : interest.companyId;
    const history = events.filter(
      (event) => event.userId === interest.userId && event.companyId === interest.companyId
    );
    return {
      id: interest.id,
      userId: interest.user.id,
      userEmail: interest.user.email,
      userName: interest.user.name,
      userPhone: interest.user.phone,
      ndaSigned: interest.user.ndaSigned,
      dniVerified: interest.user.dniVerified,
      companyId: interest.companyId,
      companyName: publicName,
      companyReference: company?.reference ?? null,
      status: normalizeRequestStatus(interest.status),
      rawStatus: interest.status,
      internalNote: interest.internalNote ?? "",
      createdAt: interest.createdAt,
      statusUpdatedAt: interest.statusUpdatedAt,
      history: history.map((event) => ({
        id: event.id,
        type: event.type,
        metadata: event.metadata,
        createdAt: event.createdAt,
      })),
    };
  });

  return NextResponse.json({ actions: list });
}
