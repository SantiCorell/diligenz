import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const authOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        // Verificar si el usuario está bloqueado
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { blocked: true, blockedUntil: true, provider: true },
        });

        if (existingUser?.blocked) {
          const isStillBlocked = existingUser.blockedUntil
            ? new Date(existingUser.blockedUntil) > new Date()
            : true;

          if (isStillBlocked) {
            return false; // Bloquear inicio de sesión
          }
        }

        // Si el usuario existe pero no tiene provider OAuth, vincular Google a su cuenta
        if (existingUser && !existingUser.provider) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              provider: "google",
              providerId: account.providerAccountId,
              name: user.name || profile?.name || null,
              image: user.image || profile?.picture || null,
              emailVerified: true,
            },
          });
        }
        // Si no existe, el adapter de NextAuth lo creará automáticamente
      }
      return true;
    },
    async session({ session, user }: any) {
      // Sincronizar con nuestro sistema de cookies
      if (session.user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true, blocked: true, blockedUntil: true },
          });

          if (dbUser) {
            // Verificar si está bloqueado
            if (dbUser.blocked) {
              const isStillBlocked = dbUser.blockedUntil
                ? new Date(dbUser.blockedUntil) > new Date()
                : true;

              if (isStillBlocked) {
                // En lugar de lanzar error, retornar sesión sin datos para que NextAuth maneje el logout
                return session;
              }
            }

            // Crear cookie de sesión compatible con nuestro sistema
            try {
              const cookieStore = await cookies();
              cookieStore.set("session", dbUser.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 días
              });
            } catch (cookieError) {
              // Si hay error con cookies, continuar de todas formas
              console.error("Error setting session cookie:", cookieError);
            }

            (session as any).userId = dbUser.id;
            (session as any).role = dbUser.role;
          }
        } catch (error) {
          console.error("Error in session callback:", error);
          // Retornar sesión básica si hay error
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: any) {
      // Cuando se crea un usuario nuevo con Google, establecer rol por defecto
      if (user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              role: "BUYER", // Rol por defecto para nuevos usuarios OAuth
              emailVerified: true,
            },
          });
        } catch (error) {
          console.error("Error setting default role for OAuth user:", error);
          // No lanzar error para no interrumpir el flujo de creación
        }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database" as const,
  },
};

const { handlers } = NextAuth(authOptions);

// Wrapper para compatibilidad con Next.js 16 (context con params)
type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function handleGET(
  req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const result = await handlers.GET(req);
  return result as Response;
}

async function handlePOST(
  req: NextRequest,
  context: RouteContext
): Promise<Response> {
  const result = await handlers.POST(req);
  return result as Response;
}

// Type assertion para satisfacer Next.js RouteHandlerConfig
export const GET = handleGET as unknown as (
  req: NextRequest,
  context: RouteContext
) => Promise<Response | void>;
export const POST = handlePOST as unknown as (
  req: NextRequest,
  context: RouteContext
) => Promise<Response | void>;
