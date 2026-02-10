import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE = 60 * 30; // 30 min, igual que login y middleware

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ loggedIn: false });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });
  if (!user) {
    return NextResponse.json({ loggedIn: false });
  }

  // Sesión deslizante: renovar cookie en cada comprobación (p. ej. desde la Navbar en la web).
  // Así Panel → Web → "Mi Panel" mantiene la sesión sin tener que volver a loguearse.
  const res = NextResponse.json({
    loggedIn: true,
    role: user.role ?? null,
  });
  res.cookies.set("session", session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
