import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  dashboardPathForRole,
  isOAuthSignupRole,
  OAUTH_SIGNUP_ROLE_COOKIE,
} from "@/lib/oauth-signup";
import { createSession, setSessionCookieOnResponse } from "@/lib/session";

/**
 * Tras login con Google (NextAuth), crea la cookie "session" que usa el resto de la app.
 */
export async function GET(req: Request) {
  const nextAuthSession = await auth();
  const email = nextAuthSession?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      phone: true,
      provider: true,
      oauthProfileComplete: true,
      deletedAt: true,
      accountStatus: true,
      blocked: true,
      blockedUntil: true,
    },
  });

  if (!user || user.deletedAt != null || user.accountStatus === "REJECTED") {
    return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
  }

  if (user.blocked) {
    const isStillBlocked = user.blockedUntil
      ? new Date(user.blockedUntil) > new Date()
      : true;
    if (isStillBlocked) {
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }
  }

  const cookieStore = await cookies();
  const pendingRole = cookieStore.get(OAUTH_SIGNUP_ROLE_COOKIE)?.value;

  if (pendingRole && isOAuthSignupRole(pendingRole)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: pendingRole,
        oauthProfileComplete: true,
      },
      select: {
        id: true,
        role: true,
        phone: true,
        provider: true,
        oauthProfileComplete: true,
        deletedAt: true,
        accountStatus: true,
        blocked: true,
        blockedUntil: true,
      },
    });
  }

  const redirectParam = new URL(req.url).searchParams.get("redirect") || "/dashboard";
  const requestedRedirect = redirectParam.startsWith("/") ? redirectParam : "/dashboard";

  const needsProfileSetup =
    user.provider === "google" &&
    (!user.oauthProfileComplete || !user.phone?.trim());

  const redirectTo = needsProfileSetup
    ? "/register/elegir-perfil"
    : requestedRedirect === "/dashboard" || requestedRedirect === "/register/elegir-perfil"
      ? dashboardPathForRole(user.role)
      : requestedRedirect;

  const token = await createSession(user.id);
  const res = NextResponse.redirect(new URL(redirectTo, req.url));
  setSessionCookieOnResponse(res, token);

  if (pendingRole && isOAuthSignupRole(pendingRole)) {
    res.cookies.set(OAUTH_SIGNUP_ROLE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}
