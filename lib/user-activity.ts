import type { Prisma, UserActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UserActivityMetadata = Record<string, Prisma.InputJsonValue>;

export async function logUserActivity(params: {
  userId: string;
  type: UserActivityType;
  companyId?: string | null;
  metadata?: UserActivityMetadata;
}) {
  return prisma.userActivityEvent.create({
    data: {
      userId: params.userId,
      type: params.type,
      companyId: params.companyId ?? null,
      metadata: params.metadata,
    },
  });
}

const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "pendiente",
  MANAGED: "gestionada",
  REJECTED: "rechazada",
};

export function formatUserActivityDescription(
  type: UserActivityType,
  metadata: Record<string, unknown> | null,
  companyName?: string | null
): string {
  const company = companyName ? ` «${companyName}»` : "";
  switch (type) {
    case "INFO_REQUEST_CREATED":
      if (metadata?.revived) {
        return `Nueva solicitud de información${company} (tras rechazo anterior)`;
      }
      return `Solicitud de información${company}`;
    case "INFO_REQUEST_STATUS_CHANGED": {
      const from = REQUEST_STATUS_LABELS[String(metadata?.from ?? "")] ?? String(metadata?.from ?? "—");
      const to = REQUEST_STATUS_LABELS[String(metadata?.to ?? "")] ?? String(metadata?.to ?? "—");
      return `Solicitud${company}: ${from} → ${to}`;
    }
    case "INFO_REQUEST_CANCELLED":
      return `Canceló solicitud de información${company}`;
    case "FAVORITE_ADDED":
      return `Añadió a favoritos${company}`;
    case "FAVORITE_REMOVED":
      return `Quitó de favoritos${company}`;
    default:
      return type;
  }
}

const INFO_REQUEST_EVENT_TYPES = [
  "INFO_REQUEST_CREATED",
  "INFO_REQUEST_STATUS_CHANGED",
  "INFO_REQUEST_CANCELLED",
] as const;

export type InfoRequestSummaryStatus = "PENDING" | "MANAGED" | "REJECTED" | "CANCELLED";

export type UserInfoRequestSummary = {
  companyId: string;
  interestId: string | null;
  status: InfoRequestSummaryStatus;
  updatedAt: Date;
};

export function formatInfoRequestSummaryDescription(
  status: InfoRequestSummaryStatus,
  companyName?: string | null
): string {
  const company = companyName ? ` «${companyName}»` : "";
  switch (status) {
    case "PENDING":
      return `Solicitud pendiente${company}`;
    case "MANAGED":
      return `Solicitud gestionada${company}`;
    case "REJECTED":
      return `Solicitud rechazada${company}`;
    case "CANCELLED":
      return `Solicitud cancelada${company}`;
    default:
      return `Solicitud${company}`;
  }
}

/** Una fila por empresa: estado actual de la solicitud (sin duplicar eventos). */
export async function getUserInfoRequestSummaries(userId: string): Promise<UserInfoRequestSummary[]> {
  const [interests, events] = await Promise.all([
    prisma.userCompanyInterest.findMany({
      where: { userId, type: "REQUEST_INFO" },
    }),
    prisma.userActivityEvent.findMany({
      where: {
        userId,
        type: { in: [...INFO_REQUEST_EVENT_TYPES] },
        companyId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latestEventAt = new Map<string, Date>();
  const cancelledOnly = new Set<string>();

  for (const event of events) {
    if (!event.companyId) continue;
    if (!latestEventAt.has(event.companyId)) {
      latestEventAt.set(event.companyId, event.createdAt);
      if (event.type === "INFO_REQUEST_CANCELLED") {
        cancelledOnly.add(event.companyId);
      }
    }
  }

  const summaries: UserInfoRequestSummary[] = [];
  const activeCompanyIds = new Set<string>();

  for (const interest of interests) {
    activeCompanyIds.add(interest.companyId);
    summaries.push({
      companyId: interest.companyId,
      interestId: interest.id,
      status: (interest.status ?? "PENDING") as InfoRequestSummaryStatus,
      updatedAt: latestEventAt.get(interest.companyId) ?? interest.createdAt,
    });
  }

  for (const companyId of cancelledOnly) {
    if (activeCompanyIds.has(companyId)) continue;
    const updatedAt = latestEventAt.get(companyId);
    if (!updatedAt) continue;
    summaries.push({
      companyId,
      interestId: null,
      status: "CANCELLED",
      updatedAt,
    });
  }

  summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return summaries;
}

export async function getUserActivityStats(userId: string) {
  const [totalCreated, interests, favoriteCount] = await Promise.all([
    prisma.userActivityEvent.count({
      where: { userId, type: "INFO_REQUEST_CREATED" },
    }),
    prisma.userCompanyInterest.findMany({
      where: { userId, type: "REQUEST_INFO" },
      select: { status: true },
    }),
    prisma.userCompanyInterest.count({
      where: { userId, type: "FAVORITE" },
    }),
  ]);

  let active = 0;
  let managed = 0;
  let rejected = 0;
  for (const row of interests) {
    const status = row.status ?? "PENDING";
    if (status === "PENDING") active += 1;
    else if (status === "MANAGED") {
      active += 1;
      managed += 1;
    } else if (status === "REJECTED") rejected += 1;
  }

  return {
    totalInfoRequests: totalCreated,
    activeInfoRequests: active,
    managedInfoRequests: managed,
    rejectedInfoRequests: rejected,
    favoriteCount,
  };
}
