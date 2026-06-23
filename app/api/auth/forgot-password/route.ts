import { NextResponse } from "next/server";
import { createPasswordResetToken, buildPasswordResetUrl } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/emails/password-reset";
import { isEmailConfigured } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP, isValidEmail } from "@/lib/security";

const GENERIC_OK = {
  ok: true,
  message: "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.",
};

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req.headers);
    const rateLimitResult = checkRateLimit(getRateLimitIdentifier(ip, "forgot-password"), {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const emailRaw = typeof body.email === "string" ? body.email : "";

    if (!emailRaw.trim()) {
      return NextResponse.json({ error: "Indica tu email." }, { status: 400 });
    }

    if (!isValidEmail(emailRaw)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "El envío de correos no está configurado. Contacta con soporte." },
        { status: 503 }
      );
    }

    const email = emailRaw.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, provider: true, deletedAt: true },
    });

    if (user && user.deletedAt == null && user.passwordHash) {
      const plainToken = await createPasswordResetToken(email);
      const resetUrl = buildPasswordResetUrl(email, plainToken);
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      } catch (e) {
        console.error("[forgot-password] email error:", e);
      }
    }

    return NextResponse.json(GENERIC_OK);
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Error al procesar la solicitud." }, { status: 500 });
  }
}
