import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { extractScheduleTimes, fetchCalendlyEventTimes } from "@/lib/agents";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const meetings = await prisma.agentMeeting.findMany({
    where: { userId: session.userId, status: "SCHEDULED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      status: true,
      agent: { select: { name: true } },
    },
  });

  return NextResponse.json({
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      startsAt: meeting.startsAt?.toISOString() ?? null,
      endsAt: meeting.endsAt?.toISOString() ?? null,
      status: meeting.status,
      agentName: meeting.agent.name,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      assignedAgent: {
        select: { id: true, name: true, active: true, bookingUrl: true },
      },
    },
  });
  const agent = user?.assignedAgent;
  if (!agent || !agent.active || !agent.bookingUrl) {
    return NextResponse.json(
      { error: "Tu agente no tiene agenda online disponible." },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { payload?: unknown };
  const extracted = extractScheduleTimes(body.payload);
  let startsAt = extracted.startsAt;
  let endsAt = extracted.endsAt;
  let title = `Reunión con ${agent.name}`;

  if (extracted.eventUri) {
    const remote = await fetchCalendlyEventTimes(extracted.eventUri);
    if (remote) {
      startsAt = remote.startsAt;
      endsAt = remote.endsAt;
      if (remote.name) title = remote.name;
    }
  }

  if (startsAt && !endsAt) {
    endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
  }

  if (extracted.eventUri) {
    const existing = await prisma.agentMeeting.findUnique({
      where: { externalEventUri: extracted.eventUri },
      select: {
        id: true,
        userId: true,
        title: true,
        startsAt: true,
        endsAt: true,
        status: true,
      },
    });
    if (existing) {
      if (existing.userId !== session.userId) {
        return NextResponse.json({ error: "Esa reserva ya está asignada." }, { status: 409 });
      }
      return NextResponse.json({
        meeting: {
          id: existing.id,
          title: existing.title,
          startsAt: existing.startsAt?.toISOString() ?? null,
          endsAt: existing.endsAt?.toISOString() ?? null,
          status: existing.status,
          agentName: agent.name,
        },
        needsTime: !existing.startsAt,
      });
    }
  }

  const meeting = await prisma.agentMeeting.create({
    data: {
      userId: session.userId,
      agentId: agent.id,
      title,
      startsAt,
      endsAt,
      externalEventUri: extracted.eventUri,
    },
    select: { id: true, title: true, startsAt: true, endsAt: true, status: true },
  });

  return NextResponse.json(
    {
      meeting: {
        id: meeting.id,
        title: meeting.title,
        startsAt: meeting.startsAt?.toISOString() ?? null,
        endsAt: meeting.endsAt?.toISOString() ?? null,
        status: meeting.status,
        agentName: agent.name,
      },
      needsTime: !meeting.startsAt,
    },
    { status: 201 }
  );
}
