/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

function diligenzAdapter(): Adapter {
  const base = PrismaAdapter(prisma) as Adapter;
  return {
    ...base,
    createUser: async (user) => {
      const created = await prisma.user.create({
        data: {
          email: user.email!,
          emailVerified: Boolean(user.emailVerified),
          name: user.name ?? null,
          image: user.image ?? null,
          role: "BUYER",
          provider: "google",
          oauthProfileComplete: false,
        },
      });
      return {
        id: created.id,
        email: created.email,
        emailVerified: created.emailVerified ? new Date() : null,
        name: created.name,
        image: created.image,
      };
    },
  };
}

/**
 * Auth.js v5: configuración central.
 * La ruta app/api/auth/[...nextauth]/route.ts solo re-exporta los handlers.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: diligenzAdapter() as any,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ??
        process.env.AUTH_GOOGLE_ID ??
        "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ??
        process.env.AUTH_GOOGLE_SECRET ??
        "",
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth/sync-session")) {
        return url;
      }

      let destination = "/dashboard";
      try {
        const parsed = new URL(url, baseUrl);
        if (
          parsed.origin === baseUrl &&
          parsed.pathname !== "/login" &&
          parsed.pathname !== "/register" &&
          !parsed.pathname.startsWith("/api/auth/")
        ) {
          destination = `${parsed.pathname}${parsed.search}`;
        }
      } catch {
        // mantener /dashboard
      }

      return `${baseUrl}/api/auth/sync-session?redirect=${encodeURIComponent(destination)}`;
    },
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
      if (session?.user?.email) {
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
            data: {
              provider: "google",
              emailVerified: true,
            },
          });
        } catch (error) {
          console.error("Error setting OAuth fields for new user:", error);
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
