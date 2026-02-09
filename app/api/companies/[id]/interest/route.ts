import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ requestInfo: false, favorite: false });
  }
  
  // Verificar si el usuario está bloqueado
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { blocked: true, blockedUntil: true },
  });
  
  if (user?.blocked) {
    const isStillBlocked = user.blockedUntil 
      ? new Date(user.blockedUntil) > new Date()
      : true;
    
    if (isStillBlocked) {
      return NextResponse.json(
        { error: "Tu cuenta está temporalmente bloqueada por actividad sospechosa" },
        { status: 403 }
      );
    }
  }
  
  const { id: companyId } = await params;
  
  // Validar que companyId sea válido
  if (!companyId || typeof companyId !== "string" || companyId.length > 100) {
    return NextResponse.json({ error: "ID de empresa inválido" }, { status: 400 });
  }
  
  const interests = await prisma.userCompanyInterest.findMany({
    where: { userId: session.value, companyId },
  });
  const requestInfo = interests.some((i) => i.type === "REQUEST_INFO");
  const favorite = interests.some((i) => i.type === "FAVORITE");
  return NextResponse.json({ requestInfo, favorite });
}

export async function POST(req: Request, { params }: Params) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "Inicia sesión para continuar" }, { status: 401 });
  }
  
  // Verificar si el usuario está bloqueado
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { blocked: true, blockedUntil: true },
  });
  
  if (user?.blocked) {
    const isStillBlocked = user.blockedUntil 
      ? new Date(user.blockedUntil) > new Date()
      : true;
    
    if (isStillBlocked) {
      return NextResponse.json(
        { error: "Tu cuenta está temporalmente bloqueada por actividad sospechosa" },
        { status: 403 }
      );
    }
  }
  
  const { id: companyId } = await params;
  
  // Validar companyId
  if (!companyId || typeof companyId !== "string" || companyId.length > 100) {
    return NextResponse.json({ error: "ID de empresa inválido" }, { status: 400 });
  }
  
  // Rate limiting: máximo 10 solicitudes por minuto por usuario
  const ip = getClientIP(req.headers);
  const rateLimitResult = checkRateLimit(
    getRateLimitIdentifier(ip, session.value),
    { maxRequests: 10, windowMs: 60 * 1000 } // 10 por minuto
  );
  
  if (!rateLimitResult.allowed) {
    // Si excede el límite, bloquear temporalmente (1 hora)
    const blockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: session.value },
      data: { blocked: true, blockedUntil },
    }).catch(() => {}); // Ignorar errores en el bloqueo
    
    return NextResponse.json(
      { 
        error: "Demasiadas solicitudes. Tu cuenta ha sido bloqueada temporalmente por 1 hora." 
      },
      { 
        status: 429,
        headers: {
          "Retry-After": "3600",
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      }
    );
  }
  
  const body = await req.json().catch(() => ({}));
  const type = body.type === "FAVORITE" ? "FAVORITE" : "REQUEST_INFO";
  
  // Verificar límite de solicitudes de información por día (máximo 20)
  if (type === "REQUEST_INFO") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRequests = await prisma.userCompanyInterest.count({
      where: {
        userId: session.value,
        type: "REQUEST_INFO",
        createdAt: { gte: today },
      },
    });
    
    if (todayRequests >= 20) {
      return NextResponse.json(
        { error: "Has alcanzado el límite diario de solicitudes de información (20 por día)" },
        { status: 429 }
      );
    }
  }
  
  await prisma.userCompanyInterest.upsert({
    where: {
      userId_companyId_type: { userId: session.value, companyId, type },
    },
    create: { userId: session.value, companyId, type },
    update: {},
  });
  
  return NextResponse.json(
    { ok: true, type },
    {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    }
  );
}

export async function DELETE(req: Request, { params }: Params) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: companyId } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "FAVORITE" ? "FAVORITE" : "REQUEST_INFO";
  await prisma.userCompanyInterest.deleteMany({
    where: { userId: session.value, companyId, type },
  });
  return NextResponse.json({ ok: true });
}
