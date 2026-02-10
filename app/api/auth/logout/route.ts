import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  destroySessionByToken,
  clearSessionCookieOnResponse,
} from "@/lib/session";

export async function GET(req: Request) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  await destroySessionByToken(token);
  const url = new URL(req.url);
  const response = NextResponse.redirect(url.origin + "/");
  clearSessionCookieOnResponse(response);
  return response;
}

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  await destroySessionByToken(token);
  const response = NextResponse.json({ success: true });
  clearSessionCookieOnResponse(response);
  return response;
}
