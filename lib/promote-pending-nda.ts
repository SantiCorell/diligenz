import { prisma } from "@/lib/prisma";
import { logUserActivity } from "@/lib/user-activity";

/** Pasa a En revisión las solicitudes que esperaban el mandato, si ya está firmado. */
export async function promotePendingNdaRequests(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ndaSigned: true },
  });
  if (!user?.ndaSigned) return 0;

  const pending = await prisma.userCompanyInterest.findMany({
    where: {
      userId,
      type: "REQUEST_INFO",
      status: { in: ["PENDING", "PENDING_NDA"] },
    },
    select: { id: true, companyId: true, status: true },
  });
  if (pending.length === 0) return 0;

  await prisma.userCompanyInterest.updateMany({
    where: { id: { in: pending.map((row) => row.id) } },
    data: { status: "IN_REVIEW", statusUpdatedAt: new Date() },
  });

  await Promise.all(
    pending.map((row) =>
      logUserActivity({
        userId,
        type: "INFO_REQUEST_STATUS_CHANGED",
        companyId: row.companyId,
        metadata: {
          from: row.status ?? "PENDING_NDA",
          to: "IN_REVIEW",
          automatic: true,
          reason: "mandato_firmado",
        },
      })
    )
  );

  return pending.length;
}
