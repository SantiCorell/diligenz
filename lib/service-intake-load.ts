import { prisma } from "@/lib/prisma";
import { toIntakeSnapshot } from "@/lib/service-intake";

const fileSelect = { id: true, name: true, slot: true } as const;

export async function loadIntakeSnapshot(target: { clientServiceId?: string | null; contactRequestId?: string | null }) {
  const or = [
    target.clientServiceId ? { clientServiceId: target.clientServiceId } : null,
    target.contactRequestId ? { contactRequestId: target.contactRequestId } : null,
  ].filter((item): item is { clientServiceId: string } | { contactRequestId: string } => item !== null);

  const row = or.length
    ? await prisma.serviceIntake.findFirst({
        where: { OR: or },
        include: { files: { orderBy: { createdAt: "desc" }, select: fileSelect } },
      })
    : null;
  return toIntakeSnapshot(row, target);
}
