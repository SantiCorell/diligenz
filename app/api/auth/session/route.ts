import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest, renewSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  await renewSession(session.sessionToken);
  return NextResponse.json({
    loggedIn: true,
    role: session.user.role ?? null,
  });
}
