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
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { provider: true },
    });

    if (existingUser) {
      // Si el usuario existe con OAuth, sugerir usar Google
      if (existingUser.provider) {
        return NextResponse.json(
          { error: "Este email ya está registrado con Google. Por favor, inicia sesión con Google." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12); // Aumentar rounds para más seguridad

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        phone: phone.trim(),
        role,
      },
    });

    const response = NextResponse.json(
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

    // Cookie de sesión segura
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
