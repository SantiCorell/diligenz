/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Auth.js v5: configuración central.
 * La ruta app/api/auth/[...nextauth]/route.ts solo re-exporta los handlers.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  // Auth.js v5 usa AUTH_SECRET; NextAuth clásico usa NEXTAUTH_SECRET
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { blocked: true, blockedUntil: true, provider: true },
          });

          if (existingUser?.blocked) {
            const isStillBlocked = existingUser.blockedUntil
              ? new Date(existingUser.blockedUntil) > new Date()
              : true;
            if (isStillBlocked) return false;
          }

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
        } catch (e) {
          console.error("[auth] signIn callback error:", e);
        }
      }
      return true;
    },
    async session({ session }: any) {
      if (session.user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true, blocked: true, blockedUntil: true },
          });

          if (dbUser) {
            if (dbUser.blocked) {
              const isStillBlocked = dbUser.blockedUntil
                ? new Date(dbUser.blockedUntil) > new Date()
                : true;
              if (isStillBlocked) return session;
            }
            try {
              const cookieStore = await cookies();
              cookieStore.set("session", dbUser.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 30, // 30 min; se renueva al usar el panel (sesión deslizante)
              });
            } catch (cookieError) {
              console.error("Error setting session cookie:", cookieError);
            }
            (session as any).userId = dbUser.id;
            (session as any).role = dbUser.role;
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: any) {
      if (user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "BUYER", emailVerified: true },
          });
        } catch (error) {
          console.error("Error setting default role for OAuth user:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
});
