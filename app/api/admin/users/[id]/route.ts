import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserAccountStatus } from "@prisma/client";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

const STATUSES: UserAccountStatus[] = ["PENDING", "IN_REVIEW", "ACTIVE", "REJECTED"];

type PatchBody = {
  emailVerified?: unknown;
  ndaSigned?: unknown;
  dniVerified?: unknown;
  profileVerifiedByAdmin?: unknown;
  accountStatus?: unknown;
};

/**
 * PATCH: flags de verificación y/o estado de cuenta.
 * DELETE: baja lógica (libera email para un alta futura).
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Usuario no indicado" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as PatchBody;
  const data: {
    emailVerified?: boolean;
    ndaSigned?: boolean;
    dniVerified?: boolean;
    profileVerifiedByAdmin?: boolean;
    accountStatus?: UserAccountStatus;
  } = {};

  if (typeof body.emailVerified === "boolean") data.emailVerified = body.emailVerified;
  if (typeof body.ndaSigned === "boolean") data.ndaSigned = body.ndaSigned;
  if (typeof body.dniVerified === "boolean") data.dniVerified = body.dniVerified;
  if (typeof body.profileVerifiedByAdmin === "boolean") {
    data.profileVerifiedByAdmin = body.profileVerifiedByAdmin;
  }
  if (
    typeof body.accountStatus === "string" &&
    STATUSES.includes(body.accountStatus as UserAccountStatus)
  ) {
    data.accountStatus = body.accountStatus as UserAccountStatus;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      {
        error:
          "Envía al menos un campo: emailVerified, ndaSigned, dniVerified, profileVerifiedByAdmin, accountStatus",
      },
      { status: 400 }
    );
  }

  const alive = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true },
  });
  if (!alive) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        ndaSigned: true,
        dniVerified: true,
        profileVerifiedByAdmin: true,
        phone: true,
        accountStatus: true,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Usuario no indicado" }, { status: 400 });
  }

  if (userId === session.userId) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true },
  });

  if (!target || target.deletedAt) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({
      where: { role: "ADMIN", deletedAt: null },
    });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "No se puede eliminar el último administrador." },
        { status: 400 }
      );
    }
  }

  const freedEmail = `removed_${userId.replace(/[^a-z0-9]/gi, "")}_${Date.now()}@user-removed.invalid`;

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: freedEmail,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
