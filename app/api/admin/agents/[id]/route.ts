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

type Params = { params: Promise<{ id: string }> };

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

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.agent.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const name = parseAgentName(body.name, false);
    const email = parseAgentEmail(body.email, false);
    const phone = parseAgentPhone(body.phone);
    const bookingUrl = body.bookingUrl !== undefined ? parseBookingUrl(body.bookingUrl) : undefined;
    const photo = body.photoDataUrl != null && body.photoDataUrl !== ""
      ? parsePhotoDataUrl(body.photoDataUrl)
      : null;
    const clearPhoto = body.clearPhoto === true;

    const data: {
      name?: string;
      email?: string;
      phone?: string | null;
      bookingUrl?: string | null;
      active?: boolean;
      isDefault?: boolean;
      photoMime?: string | null;
      photoData?: Uint8Array<ArrayBuffer> | null;
    } = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (bookingUrl !== undefined) data.bookingUrl = bookingUrl;
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.isDefault === "boolean") data.isDefault = body.isDefault;
    if (clearPhoto) {
      data.photoMime = null;
      data.photoData = null;
    }
    if (photo) {
      data.photoMime = photo.mime;
      data.photoData = photo.bytes;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
    }

    const agent = await prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.agent.updateMany({
          where: { isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.agent.update({ where: { id }, data, select: agentSelect });
    });

    return NextResponse.json({ agent });
  } catch (error) {
    if (error instanceof AgentInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.agent.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!existing) return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });

  await prisma.agent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
