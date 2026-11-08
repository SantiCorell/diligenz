import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { buildMeetingIcs } from "@/lib/meeting-ics";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const meeting = await prisma.agentMeeting.findFirst({
    where: { id, userId: session.userId, status: "SCHEDULED" },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      agent: { select: { name: true, email: true } },
    },
  });
  if (!meeting?.startsAt) {
    return NextResponse.json({ error: "Esta reunión todavía no tiene hora." }, { status: 400 });
  }

  const endsAt = meeting.endsAt ?? new Date(meeting.startsAt.getTime() + 30 * 60 * 1000);
  const ics = buildMeetingIcs({
    uid: meeting.id,
    title: meeting.title,
    startsAt: meeting.startsAt,
    endsAt,
    description: `Reunión con ${meeting.agent.name} en Diligenz.`,
    organizerName: meeting.agent.name,
    organizerEmail: meeting.agent.email,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="reunion-diligenz.ics"`,
    },
  });
}
