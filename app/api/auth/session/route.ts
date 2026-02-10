import { NextResponse } from "next/server";
import {
  getSessionTokenFromRequest,
  getSessionFromToken,
  renewSession,
} from "@/lib/session";

export async function GET(req: Request) {
  const token = await getSessionTokenFromRequest(req);
  const session = await getSessionFromToken(token ?? undefined);
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  await renewSession(session.sessionToken);
  return NextResponse.json({
    loggedIn: true,
    role: session.user.role ?? null,
  });
}
