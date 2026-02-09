import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP, isValidEmail } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // Rate limiting: máximo 10 intentos de login por 15 minutos por IP
    const ip = getClientIP(req.headers);
    const rateLimitResult = checkRateLimit(
      getRateLimitIdentifier(ip, null),
      { maxRequests: 10, windowMs: 15 * 60 * 1000 } // 10 por 15 minutos
    );
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intenta de nuevo más tarde." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }
    
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña obligatorios" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    let user: { id: string; passwordHash: string | null; blocked: boolean; blockedUntil: Date | null; provider: string | null } | null = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          passwordHash: true,
          blocked: true,
          blockedUntil: true,
          provider: true,
        },
      });
    } catch (dbError) {
      console.error("Login DB error:", process.env.NODE_ENV === "production" ? "connection failed" : dbError);
      return NextResponse.json(
        { error: "Error al iniciar sesión. Inténtalo de nuevo en unos segundos." },
        { status: 500 }
      );
    }

    if (!user) {
      // No revelar si el usuario existe o no por seguridad
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Si el usuario se registró con OAuth (Google), no puede usar email/password
    if (user.provider && !user.passwordHash) {
      return NextResponse.json(
        { error: "Esta cuenta está vinculada con Google. Por favor, inicia sesión con Google." },
        { status: 401 }
      );
    }

    // Verificar que el usuario tenga contraseña
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Verificar si el usuario está bloqueado
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

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Crear cookie de sesión con configuración segura
    try {
      const cookieStore = await cookies();
      cookieStore.set("session", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
    } catch (cookieError) {
      console.error("Login cookie error:", process.env.NODE_ENV === "production" ? "set failed" : cookieError);
      return NextResponse.json(
        { error: "Error al iniciar sesión. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isPrisma = message.includes("Prisma") || message.includes("connect");
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Error al iniciar sesión",
        ...(process.env.NODE_ENV === "development" && {
          detail: isPrisma ? "Comprueba POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING y que las migraciones estén aplicadas." : message,
        }),
      },
      { status: 500 }
    );
  }
}
