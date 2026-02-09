import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * API para que los admins bloqueen/desbloqueen usuarios
 * POST /api/admin/block-user
 * Body: { userId: string, blocked: boolean, hours?: number }
 */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });
  
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, blocked, hours } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId inválido" }, { status: 400 });
    }

    if (typeof blocked !== "boolean") {
      return NextResponse.json({ error: "blocked debe ser boolean" }, { status: 400 });
    }

    const updateData: { blocked: boolean; blockedUntil?: Date | null } = {
      blocked,
    };

    if (blocked && hours && typeof hours === "number" && hours > 0) {
      // Bloquear por X horas
      updateData.blockedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    } else if (!blocked) {
      // Desbloquear
      updateData.blockedUntil = null;
    } else {
      // Bloquear indefinidamente
      updateData.blockedUntil = null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: blocked 
        ? `Usuario bloqueado${hours ? ` por ${hours} horas` : " indefinidamente"}` 
        : "Usuario desbloqueado" 
    });
  } catch (error) {
    console.error("Block user error:", error);
    return NextResponse.json(
      { error: "Error al bloquear/desbloquear usuario" },
      { status: 500 }
    );
  }
}
