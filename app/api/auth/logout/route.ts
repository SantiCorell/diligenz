import { NextResponse } from "next/server";
import { signOut } from "@/auth";
import {
  clearSessionCookieOnResponse,
  destroySessionByToken,
  getSessionTokenFromRequest,
} from "@/lib/session";

async function logout(req: Request) {
  const token = await getSessionTokenFromRequest(req);
  await destroySessionByToken(token ?? undefined);
  try {
    await signOut({ redirect: false });
  } catch {
    // NextAuth puede no tener sesión activa (login solo email/contraseña)
  }
}

export async function GET(req: Request) {
  await logout(req);
  const res = NextResponse.redirect(new URL("/", req.url));
  clearSessionCookieOnResponse(res);
  return res;
}

export async function POST(req: Request) {
  await logout(req);
  const res = NextResponse.json({ success: true });
  clearSessionCookieOnResponse(res);
  return res;
}
