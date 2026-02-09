import { NextResponse } from "next/server";

/**
 * Endpoint para iniciar sesión con Google
 * Redirige a la página de inicio de sesión de NextAuth
 */
export async function GET() {
  // Esta ruta redirige al callback de NextAuth
  // El usuario será redirigido a /api/auth/signin/google
  return NextResponse.redirect("/api/auth/signin/google");
}
