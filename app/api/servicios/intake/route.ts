import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { cleanIntakeFields, toIntakeSnapshot } from "@/lib/service-intake";
import { resolveIntakeTarget } from "@/lib/service-intake-access";

const fileSelect = { id: true, name: true, slot: true } as const;

export async function PATCH(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administración puede modificar los datos del servicio." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const target = await resolveIntakeTarget(session, body);
  if ("error" in target) return NextResponse.json({ error: target.error }, { status: target.status });

  const cleaned = cleanIntakeFields(body);
  if ("error" in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 });

  const or = [
    target.clientServiceId ? { clientServiceId: target.clientServiceId } : null,
    target.contactRequestId ? { contactRequestId: target.contactRequestId } : null,
  ].filter((item): item is { clientServiceId: string } | { contactRequestId: string } => item !== null);

  const existing = await prisma.serviceIntake.findFirst({ where: { OR: or }, select: { id: true, clientServiceId: true, contactRequestId: true } });
  const saved = existing
    ? await prisma.serviceIntake.update({
        where: { id: existing.id },
        data: {
          ...cleaned.data,
          clientServiceId: existing.clientServiceId ?? target.clientServiceId,
          contactRequestId: existing.contactRequestId ?? target.contactRequestId,
        },
        include: { files: { orderBy: { createdAt: "desc" }, select: fileSelect } },
      })
    : await prisma.serviceIntake.create({
        data: {
          userId: target.userId,
          clientServiceId: target.clientServiceId,
          contactRequestId: target.contactRequestId,
          ...cleaned.data,
        },
        include: { files: { orderBy: { createdAt: "desc" }, select: fileSelect } },
      });

  return NextResponse.json({
    intake: toIntakeSnapshot(saved, {
      clientServiceId: target.clientServiceId,
      contactRequestId: target.contactRequestId,
    }),
  });
}
