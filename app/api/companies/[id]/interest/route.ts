import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCompanyInfoRequestEmail } from "@/lib/emails/company-info-request";
import { resolveCompanyDisplayName } from "@/lib/emails/resolve-company-name";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/security";
import { getUserIdFromRequest } from "@/lib/session";
import { isMockCompanyId } from "@/lib/mock-companies";
import { isCompanyRemoved } from "@/lib/is-company-removed";
import {
  getUserInfoRequestQuota,
  infoRequestLimitMessage,
} from "@/lib/buyer-info-request-limit";
import { logUserActivity } from "@/lib/user-activity";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ requestInfo: false, favorite: false });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  
  if (!companyId || typeof companyId !== "string" || companyId.length > 100) {
    return NextResponse.json({ error: "ID de empresa inválido" }, { status: 400 });
  }
  
  const interests = await prisma.userCompanyInterest.findMany({
    where: { userId, companyId },
  });
  const requestInterest = interests.find((i) => i.type === "REQUEST_INFO");
  const requestInfo = Boolean(requestInterest);
  const favorite = interests.some((i) => i.type === "FAVORITE");
  return NextResponse.json({
    requestInfo,
    requestInfoStatus: requestInterest?.status ?? null,
    favorite,
  });
}

export async function POST(req: Request, { params }: Params) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Inicia sesión para continuar" }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      blocked: true,
      blockedUntil: true,
      email: true,
      name: true,
      role: true,
      maxConcurrentInfoRequests: true,
    },
  });
  
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
  }
  
  if (user.blocked) {
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
  
  if (!companyId || typeof companyId !== "string" || companyId.length > 100) {
    return NextResponse.json({ error: "ID de empresa inválido" }, { status: 400 });
  }

  if (!isMockCompanyId(companyId) && (await isCompanyRemoved(companyId))) {
    return NextResponse.json({ error: "Empresa no disponible" }, { status: 404 });
  }

  const ip = getClientIP(req.headers);
  const rateLimitResult = checkRateLimit(
    getRateLimitIdentifier(ip, userId),
    { maxRequests: 10, windowMs: 60 * 1000 } // 10 por minuto
  );
  
  if (!rateLimitResult.allowed) {
    // Si excede el límite, bloquear temporalmente (1 hora)
    const blockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
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

    const todayRequests = await prisma.userActivityEvent.count({
      where: {
        userId,
        type: "INFO_REQUEST_CREATED",
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
  
  const existing = await prisma.userCompanyInterest.findUnique({
    where: {
      userId_companyId_type: { userId, companyId, type },
    },
  });

  let createdNewInfoRequest = false;

  if (type === "REQUEST_INFO") {
    if (!existing) {
      const quota = await getUserInfoRequestQuota({
        id: userId,
        role: user.role,
        maxConcurrentInfoRequests: user.maxConcurrentInfoRequests,
      });
      if (!quota.canRequestMore && quota.max != null) {
        return NextResponse.json(
          { error: infoRequestLimitMessage(quota.max) },
          { status: 403 }
        );
      }

      await prisma.userCompanyInterest.create({
        data: { userId, companyId, type, status: "PENDING" },
      });
      await logUserActivity({
        userId,
        type: "INFO_REQUEST_CREATED",
        companyId,
        metadata: { status: "PENDING" },
      });
      createdNewInfoRequest = true;
    } else if (existing.status === "REJECTED") {
      const quota = await getUserInfoRequestQuota({
        id: userId,
        role: user.role,
        maxConcurrentInfoRequests: user.maxConcurrentInfoRequests,
      });
      if (!quota.canRequestMore && quota.max != null) {
        return NextResponse.json(
          { error: infoRequestLimitMessage(quota.max) },
          { status: 403 }
        );
      }

      await prisma.userCompanyInterest.update({
        where: { id: existing.id },
        data: { status: "PENDING" },
      });
      await logUserActivity({
        userId,
        type: "INFO_REQUEST_CREATED",
        companyId,
        metadata: { status: "PENDING", revived: true },
      });
      createdNewInfoRequest = true;
    }
  } else if (!existing) {
    await prisma.userCompanyInterest.create({
      data: { userId, companyId, type },
    });
    await logUserActivity({
      userId,
      type: "FAVORITE_ADDED",
      companyId,
    });
  }

  if (type === "REQUEST_INFO" && createdNewInfoRequest) {
    try {
      const companyName = await resolveCompanyDisplayName(companyId);
      await sendCompanyInfoRequestEmail({
        to: user.email,
        userName: user.name,
        companyName,
        companyId,
      });
    } catch (e) {
      console.error("[interest] email solicitud info:", e);
    }
  }
  
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
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: companyId } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "FAVORITE" ? "FAVORITE" : "REQUEST_INFO";

  const existing = await prisma.userCompanyInterest.findFirst({
    where: { userId, companyId, type },
  });

  await prisma.userCompanyInterest.deleteMany({
    where: { userId, companyId, type },
  });

  if (existing) {
    await logUserActivity({
      userId,
      type: type === "FAVORITE" ? "FAVORITE_REMOVED" : "INFO_REQUEST_CANCELLED",
      companyId,
    });
  }

  return NextResponse.json({ ok: true });
}
