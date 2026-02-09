import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { getClientIP, sanitizeString, isValidEmail, isValidPhone, isValidLength } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // Rate limiting: máximo 5 formularios por hora por IP
    const ip = getClientIP(req.headers);
    const rateLimitResult = checkRateLimit(
      getRateLimitIdentifier(ip, null),
      { maxRequests: 5, windowMs: 60 * 60 * 1000 } // 5 por hora
    );
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }
    
    const body = await req.json().catch(() => ({}));
    const {
      source = "contact",
      type,
      name,
      email,
      phone,
      companyName,
      contactPerson,
      subject,
      message,
    } = body;

    // Validación mejorada
    if (!isValidLength(name, 2, 100)) {
      return NextResponse.json(
        { error: "Nombre inválido (debe tener entre 2 y 100 caracteres)." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    // Validar teléfono si se proporciona
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Teléfono inválido." },
        { status: 400 }
      );
    }

    const validType = type === "EMPRESA" ? "EMPRESA" : "PARTICULAR";
    const validSource = source === "servicios" ? "servicios" : "contact";

    // Sanitizar todos los inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = email.trim().toLowerCase().slice(0, 255);
    const sanitizedPhone = phone ? sanitizeString(phone).slice(0, 50) : null;
    const sanitizedCompanyName = companyName ? sanitizeString(companyName).slice(0, 200) : null;
    const sanitizedContactPerson = contactPerson ? sanitizeString(contactPerson).slice(0, 100) : null;
    const sanitizedSubject = subject ? sanitizeString(subject).slice(0, 200) : null;
    const sanitizedMessage = message ? sanitizeString(message).slice(0, 2000) : null;

    await prisma.contactRequest.create({
      data: {
        source: validSource,
        type: validType,
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        companyName: sanitizedCompanyName,
        contactPerson: sanitizedContactPerson,
        subject: sanitizedSubject,
        message: sanitizedMessage,
      },
    });

    return NextResponse.json(
      { ok: true },
      { 
        status: 201,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (e) {
    console.error("Contact form error:", e);
    return NextResponse.json(
      { error: "Error al enviar el mensaje. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
