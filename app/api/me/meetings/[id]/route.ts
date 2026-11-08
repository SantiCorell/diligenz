import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { AgentInputError, assertMeetingWindow } from "@/lib/agents";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const meeting = await prisma.agentMeeting.findFirst({
    where: { id, userId: session.userId, status: "SCHEDULED" },
    select: { id: true, agent: { select: { name: true } } },
  });
  if (!meeting) return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { startsAt?: unknown; endsAt?: unknown };
  if (typeof body.startsAt !== "string") {
    return NextResponse.json({ error: "Indica la hora de la reunión." }, { status: 400 });
  }

  try {
    const startsAt = new Date(body.startsAt);
    const endsAt =
      typeof body.endsAt === "string"
        ? new Date(body.endsAt)
        : new Date(startsAt.getTime() + 30 * 60 * 1000);
    assertMeetingWindow(startsAt, endsAt);

    const updated = await prisma.agentMeeting.update({
      where: { id },
      data: { startsAt, endsAt },
      select: { id: true, title: true, startsAt: true, endsAt: true, status: true },
    });

    return NextResponse.json({
      meeting: {
        id: updated.id,
        title: updated.title,
        startsAt: updated.startsAt?.toISOString() ?? null,
        endsAt: updated.endsAt?.toISOString() ?? null,
        status: updated.status,
        agentName: meeting.agent.name,
      },
    });
  } catch (error) {
    if (error instanceof AgentInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
