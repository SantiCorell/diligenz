import { NextResponse } from "next/server";

function clearSession(response: NextResponse) {
  response.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const response = NextResponse.redirect(origin + "/");
  clearSession(response);
  return response;
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSession(response);
  return response;
}
