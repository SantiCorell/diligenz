/**
 * Lógica de sesión centralizada: sesiones en base de datos (tabla Session).
 * La cookie solo guarda el sessionToken; el userId y la validez se consultan en DB.
 * Así la sesión es más fiable (no depende solo de que la cookie llegue bien).
 */

import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_SEC = 60 * 30; // 30 min

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function getSessionCookieOptionsForClear() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

/** Crea una sesión en DB y devuelve el token para poner en la cookie */
export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
  await prisma.session.create({
    data: { sessionToken, userId, expires },
  });
  return sessionToken;
}

/** Busca la sesión en DB; si existe y no ha expirado, la devuelve (con user) */
export async function getSessionFromToken(sessionToken: string | undefined) {
  if (!sessionToken?.trim()) return null;
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });
  if (!session || session.expires < new Date()) return null;
  return session;
}

/** Prórroga la sesión (sliding) y devuelve el mismo token */
export async function renewSession(sessionToken: string): Promise<boolean> {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
  const updated = await prisma.session.updateMany({
    where: { sessionToken },
    data: { expires },
  });
  return updated.count > 0;
}

/** Borra la sesión de la DB */
export async function destroySessionByToken(sessionToken: string | undefined) {
  if (!sessionToken?.trim()) return;
  await prisma.session.deleteMany({ where: { sessionToken } });
}

/** Lee el token de sesión desde las cookies de Next (en Server Components) */
export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE_NAME);
  return cookie?.value?.trim() ?? null;
}

/**
 * Lee el token desde la petición: Authorization Bearer, X-Session-Token o cookie.
 * Usar en Route Handlers para soportar token en localStorage (header) o cookie (sync desde cliente).
 */
export async function getSessionTokenFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t) return t;
  }
  const x = req.headers.get("X-Session-Token");
  if (x?.trim()) return x.trim();
  const store = await cookies();
  const c = store.get(SESSION_COOKIE_NAME);
  return c?.value?.trim() ?? null;
}

/** Sesión con user desde la petición (Route Handlers). */
export async function getSessionWithUserFromRequest(req: Request) {
  const token = await getSessionTokenFromRequest(req);
  return getSessionFromToken(token ?? undefined);
}

/** userId desde la petición (Route Handlers). */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const session = await getSessionWithUserFromRequest(req);
  return session?.userId ?? null;
}

/** Obtiene el userId si la sesión es válida; si no, null */
export async function getUserIdFromSession(): Promise<string | null> {
  const token = await getSessionTokenFromCookies();
  const session = await getSessionFromToken(token ?? undefined);
  return session?.userId ?? null;
}

/** Sesión con user incluido; null si no hay sesión válida. Para layouts y páginas. */
export async function getSessionWithUser() {
  const token = await getSessionTokenFromCookies();
  return getSessionFromToken(token ?? undefined);
}

/** Escribe la cookie de sesión en una respuesta (login, register, renovación) */
export function setSessionCookieOnResponse(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

/** Borra la cookie de sesión en una respuesta (logout) */
export function clearSessionCookieOnResponse(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE_NAME, "", getSessionCookieOptionsForClear());
}
