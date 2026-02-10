import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BETA_COOKIE = "beta_access";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session");
  const betaAccess = req.cookies.get(BETA_COOKIE);
  const { pathname } = req.nextUrl;

  // Página de acceso beta y su API: siempre permitir
  if (pathname === "/acceso" || pathname.startsWith("/api/acceso")) {
    const res = NextResponse.next();
    // Añadir headers de seguridad también a esta respuesta
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    return res;
  }

  // Si no tiene cookie de acceso beta → redirigir a /acceso
  if (!betaAccess?.value) {
    const accesoUrl = new URL("/acceso", req.url);
    return NextResponse.redirect(accesoUrl);
  }

  // Rutas que requieren autenticación (login). /sell es público (Valora tu empresa sin registro).
  const protectedRoutes = ["/dashboard", "/admin", "/documents", "/companies/mi-interes"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si intenta acceder a una ruta protegida sin sesión → redirect a /login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Headers de seguridad
  const response = NextResponse.next();

  // Sesión deslizante: renovar cookie en CUALQUIER petición con sesión (incl. "/", "/companies", etc.).
  // Así, Panel → Web → "Mi Panel" mantiene la sesión y no redirige a login.
  const SESSION_MAX_AGE = 60 * 30; // 30 min
  if (session?.value) {
    response.cookies.set("session", session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }
  
  // Prevenir clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevenir MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy básico (ajusta según tus necesidades)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  }
  
  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  return response;
}

/**
 * Configuración del matcher
 * Excluimos API, assets y archivos estáticos
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon\\.png|icon\\.svg|.*\\.svg).*)",
  ],
};
