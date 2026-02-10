import { NextResponse } from "next/server";
import { destroySessionByToken, getSessionTokenFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  const token = await getSessionTokenFromRequest(req);
  await destroySessionByToken(token ?? undefined);
  const url = new URL(req.url);
  return NextResponse.redirect(url.origin + "/");
}

export async function POST(req: Request) {
  const token = await getSessionTokenFromRequest(req);
  await destroySessionByToken(token ?? undefined);
  return NextResponse.json({ success: true });
}
