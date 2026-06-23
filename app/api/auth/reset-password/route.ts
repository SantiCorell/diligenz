import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { consumePasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP, isValidEmail } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req.headers);
    const rateLimitResult = checkRateLimit(getRateLimitIdentifier(ip, "reset-password"), {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!emailRaw.trim() || !token) {
      return NextResponse.json({ error: "Enlace inválido o incompleto." }, { status: 400 });
    }

    if (!isValidEmail(emailRaw)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json({ error: "La contraseña es demasiado larga." }, { status: 400 });
    }

    const email = emailRaw.toLowerCase().trim();
    const valid = await consumePasswordResetToken(email, token);
    if (!valid) {
      return NextResponse.json(
        { error: "El enlace ha caducado o no es válido. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt != null) {
      return NextResponse.json({ error: "Cuenta no encontrada." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "Error al actualizar la contraseña." }, { status: 500 });
  }
}
