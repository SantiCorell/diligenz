import { NextResponse } from "next/server";
import {
  isOAuthSignupRole,
  OAUTH_SIGNUP_ROLE_COOKIE,
} from "@/lib/oauth-signup";

/** Guarda el rol elegido en registro antes de redirigir a Google OAuth. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const role = typeof body.role === "string" ? body.role : "";

  if (!isOAuthSignupRole(role)) {
    return NextResponse.json({ error: "Selecciona un perfil válido." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(OAUTH_SIGNUP_ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
  return res;
}
