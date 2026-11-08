import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import {
  AgentInputError,
  parseAgentEmail,
  parseAgentName,
  parseAgentPhone,
  parseBookingUrl,
  parsePhotoDataUrl,
} from "@/lib/agents";

const agentSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  photoUrl: true,
  photoMime: true,
  bookingUrl: true,
  active: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function requireAdmin(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const agents = await prisma.agent.findMany({
    select: agentSelect,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const name = parseAgentName(body.name, true)!;
    const email = parseAgentEmail(body.email, true)!;
    const phone = parseAgentPhone(body.phone);
    const bookingUrl = parseBookingUrl(body.bookingUrl);
    const photo = body.photoDataUrl != null && body.photoDataUrl !== ""
      ? parsePhotoDataUrl(body.photoDataUrl)
      : null;
    const active = typeof body.active === "boolean" ? body.active : true;
    const isDefault = body.isDefault === true;

    const agent = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.agent.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
      }
      return tx.agent.create({
        data: {
          name,
          email,
          phone: phone ?? null,
          bookingUrl,
          active,
          isDefault,
          photoMime: photo?.mime ?? null,
          photoData: photo?.bytes ?? null,
        },
        select: agentSelect,
      });
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    if (error instanceof AgentInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
