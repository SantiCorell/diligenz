import { NextResponse } from "next/server";
import {
  getSessionTokenFromCookies,
  getSessionFromToken,
  renewSession,
  setSessionCookieOnResponse,
} from "@/lib/session";

export async function GET() {
  const token = await getSessionTokenFromCookies();
  const session = await getSessionFromToken(token ?? undefined);
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  await renewSession(session.sessionToken);
  const res = NextResponse.json({
    loggedIn: true,
    role: session.user.role ?? null,
  });
  setSessionCookieOnResponse(res, session.sessionToken);
  return res;
}
