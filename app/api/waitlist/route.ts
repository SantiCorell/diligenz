import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "El email es obligatorio" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Introduce un email válido" },
        { status: 400 }
      );
    }

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Ya estás en la lista de espera", alreadyRegistered: true },
        { status: 200 }
      );
    }

    await prisma.waitlistEntry.create({
      data: { email: normalizedEmail },
    });

    return NextResponse.json(
      { message: "Te hemos añadido a la lista de espera" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Error al apuntarte. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
