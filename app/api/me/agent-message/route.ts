import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { buildAgentMessageEmail } from "@/lib/emails/agent-message";

const MIN_LENGTH = 2;
const MAX_LENGTH = 2000;

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { message?: unknown };
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < MIN_LENGTH) {
    return NextResponse.json({ error: "Escribe un mensaje para tu gestor." }, { status: 400 });
  }
  if (message.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: "El mensaje no puede superar los 2000 caracteres." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      ndaSigned: true,
      dniVerified: true,
      profileVerifiedByAdmin: true,
      assignedAgent: { select: { name: true, email: true, active: true } },
    },
  });
  const agent = user?.assignedAgent;
  if (!user || !agent?.email) {
    return NextResponse.json(
      { error: "Todavía no tienes un gestor asignado." },
      { status: 400 }
    );
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "El envío de correo no está disponible ahora mismo." },
      { status: 503 }
    );
  }

  const displayName = user.name?.trim() || user.email;
  const email = buildAgentMessageEmail({
    agentName: agent.name,
    message,
    profile: {
      name: displayName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ndaSigned: user.ndaSigned,
      dniVerified: user.dniVerified,
      profileComplete: Boolean(user.phone?.trim() && user.name?.trim()) || user.profileVerifiedByAdmin,
    },
  });

  try {
    const sent = await sendEmail({
      to: agent.email,
      replyTo: user.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    if (!sent) {
      return NextResponse.json(
        { error: "No se ha podido enviar el mensaje." },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "No se ha podido enviar el mensaje. Inténtalo de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
