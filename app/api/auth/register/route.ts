import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP, isValidEmail, isValidPhone } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // Rate limiting: máximo 3 registros por hora por IP
    const ip = getClientIP(req.headers);
    const rateLimitResult = checkRateLimit(
      getRateLimitIdentifier(ip, null),
      { maxRequests: 3, windowMs: 60 * 60 * 1000 } // 3 por hora
    );
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Intenta de nuevo más tarde." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }
    
    const body = await req.json().catch(() => ({}));
    const { email, password, phone, role } = body;

    // Validación mejorada
    if (!email || !password || !phone || !role) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Teléfono inválido" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "La contraseña es demasiado larga" },
        { status: 400 }
      );
    }

    if (role !== "SELLER" && role !== "BUYER") {
      return NextResponse.json(
        { error: "Rol de usuario inválido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    let existingUser: { provider: string | null } | null = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { provider: true },
      });
    } catch (dbError) {
      console.error("Register DB findUnique:", process.env.NODE_ENV === "production" ? "connection failed" : dbError);
      return NextResponse.json(
        { error: "Error de conexión. Inténtalo de nuevo en unos segundos." },
        { status: 500 }
      );
    }

    if (existingUser) {
      // Si el usuario existe con OAuth (p. ej. Google, actualmente deshabilitado)
      if (existingUser.provider) {
        return NextResponse.json(
          { error: "Este email ya está registrado con un proveedor externo. Contacta con soporte si necesitas acceso." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    let user: { id: string; role: string };
    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          phone: phone.trim(),
          role,
        },
        select: { id: true, role: true },
      });
    } catch (createError) {
      const msg = createError instanceof Error ? createError.message : "";
      const isUnique = msg.includes("Unique constraint") || msg.includes("duplicate key");
      console.error("Register create:", process.env.NODE_ENV === "production" ? (isUnique ? "duplicate" : "failed") : createError);
      if (isUnique) {
        return NextResponse.json(
          { error: "Este email ya está registrado" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Error al crear la cuenta. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    // Cookie de sesión en la respuesta (igual que login) para que el navegador la guarde
    const SESSION_OPTIONS = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 30,
    };
    const res = NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        role: user.role,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      }
    );
    res.cookies.set("session", user.id, SESSION_OPTIONS);
    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
