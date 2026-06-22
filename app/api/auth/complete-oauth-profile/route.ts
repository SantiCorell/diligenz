import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dashboardPathForRole,
  isOAuthSignupRole,
} from "@/lib/oauth-signup";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isValidPhone } from "@/lib/security";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import type { WelcomeRole } from "@/lib/emails/welcome";
import { ensureUserDriveFolder } from "@/lib/google-drive/user-drive";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const roleInput = typeof body.role === "string" ? body.role : null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      oauthProfileComplete: true,
      phone: true,
      role: true,
    },
  });

  if (!user?.provider) {
    return NextResponse.json(
      { error: "Esta acción solo aplica a cuentas registradas con Google." },
      { status: 400 }
    );
  }

  const data: {
    phone?: string;
    role?: "SELLER" | "BUYER" | "PROFESSIONAL";
    oauthProfileComplete?: boolean;
  } = {};

  if (!user.oauthProfileComplete) {
    if (!roleInput || !isOAuthSignupRole(roleInput)) {
      return NextResponse.json(
        { error: "Selecciona qué quieres hacer en Diligenz." },
        { status: 400 }
      );
    }
    data.role = roleInput;
    data.oauthProfileComplete = true;
  }

  if (!user.phone || !phone) {
    if (!phone) {
      return NextResponse.json({ error: "El teléfono es obligatorio." }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Teléfono inválido." }, { status: 400 });
    }
    data.phone = phone;
  } else if (phone && phone !== user.phone) {
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Teléfono inválido." }, { status: 400 });
    }
    data.phone = phone;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No hay cambios pendientes en tu perfil." },
      { status: 400 }
    );
  }

  const isFirstOAuthSignup = !user.oauthProfileComplete && data.oauthProfileComplete === true;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { role: true, phone: true, oauthProfileComplete: true },
  });

  if (isFirstOAuthSignup && user.email) {
    const role = (updated.role ?? data.role ?? "BUYER") as WelcomeRole;
    const personName = user.name?.trim() || user.email.split("@")[0];

    try {
      const sent = await sendWelcomeEmail({
        to: user.email,
        name: personName,
        role,
      });
      if (sent) {
        console.log("[complete-oauth-profile] welcome email enviado a", user.email);
      } else {
        console.warn("[complete-oauth-profile] welcome email no enviado (SMTP no configurado)");
      }
    } catch (emailError) {
      console.error("[complete-oauth-profile] welcome email error:", emailError);
    }

    try {
      await ensureUserDriveFolder({
        userId: user.id,
        role,
        personName,
        userEmail: user.email,
      });
    } catch (driveError) {
      console.error("[complete-oauth-profile] google drive folder error:", driveError);
    }
  }

  const needsMore =
    !updated.oauthProfileComplete || !updated.phone?.trim();

  return NextResponse.json({
    ok: true,
    role: updated.role,
    redirect: needsMore ? "/register/elegir-perfil" : dashboardPathForRole(updated.role),
  });
}
