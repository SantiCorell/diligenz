import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session");
  const { pathname } = req.nextUrl;

  // Rutas que requieren autenticación
  const protectedRoutes = ["/sell", "/dashboard", "/admin"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si intenta acceder a una ruta protegida sin sesión → redirect a /register
  if (isProtectedRoute && !session) {
    const registerUrl = new URL("/register", req.url);
    return NextResponse.redirect(registerUrl);
  }

  // Headers de seguridad
  const response = NextResponse.next();
  
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
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.svg).*)",
  ],
};
