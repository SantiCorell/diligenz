import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { DRIVE_OAUTH_SETUP_COOKIE } from "@/lib/google-drive/oauth-setup";

/** Inicia OAuth Drive reutilizando el callback de NextAuth (ya registrado en Google Cloud). */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Solo disponible en desarrollo local" }, { status: 403 });
  }

  const origin = new URL(req.url).origin;
  const cookieStore = await cookies();
  cookieStore.set(DRIVE_OAUTH_SETUP_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  await signIn(
    "google",
    { redirectTo: `${origin}/api/drive/oauth/done` },
    {
      scope: "openid email profile https://www.googleapis.com/auth/drive",
      access_type: "offline",
      prompt: "consent",
    }
  );
}
