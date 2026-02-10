import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSessionWithUser } from "@/lib/session";

/**
 * Solo el admin puede crear usuarios (incluido otros admins).
 * GET: listar usuarios (solo admin)
 * POST: crear usuario con rol indicado (solo admin)
 */
export async function GET() {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      blocked: true,
      blockedUntil: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo un administrador puede crear usuarios." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { email, password, role = "ADMIN", phone } = body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "El email es obligatorio." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const validRole = role === "ADMIN" || role === "BUYER" || role === "SELLER" ? role : "ADMIN";
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: validRole,
      phone: phone && typeof phone === "string" ? phone.trim() || null : null,
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
