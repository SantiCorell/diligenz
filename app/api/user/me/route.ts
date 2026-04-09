import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isValidPhone } from "@/lib/security";

const NAME_MAX = 120;
const PHONE_MAX = 40;

/**
 * PATCH: el usuario autenticado actualiza su nombre y teléfono (comprador, vendedor, profesional, admin).
 */
export async function PATCH(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const u = session.user;
  if (u.deletedAt != null || u.accountStatus === "REJECTED") {
    return NextResponse.json({ error: "Cuenta no disponible" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const nameRaw = body.name;
  const phoneRaw = body.phone;

  const data: { name?: string | null; phone?: string | null } = {};

  if (nameRaw !== undefined) {
    if (typeof nameRaw !== "string") {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    const t = nameRaw.trim();
    if (t.length > NAME_MAX) {
      return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
    }
    data.name = t.length ? t : null;
  }

  if (phoneRaw !== undefined) {
    if (typeof phoneRaw !== "string") {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }
    const t = phoneRaw.trim();
    if (t.length > PHONE_MAX) {
      return NextResponse.json({ error: "Teléfono demasiado largo" }, { status: 400 });
    }
    if (t.length > 0 && !isValidPhone(t)) {
      return NextResponse.json({ error: "Formato de teléfono no válido" }, { status: 400 });
    }
    data.phone = t.length ? t : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Envía al menos name o phone" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: u.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      profileVerifiedByAdmin: true,
    },
  });

  return NextResponse.json({ user: updated });
}
