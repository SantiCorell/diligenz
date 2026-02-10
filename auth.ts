/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
// Login con Google deshabilitado (comentado para reactivar en el futuro)
// import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * Auth.js v5: configuración central.
 * La ruta app/api/auth/[...nextauth]/route.ts solo re-exporta los handlers.
 * Actualmente solo login por email/contraseña; Google está comentado.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    // Google (deshabilitado): descomentar para volver a activar login con Google
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    // }),
  ],
  callbacks: {
    // signIn para Google: descomentar al reactivar Google
    // async signIn({ user, account, profile }: any) {
    //   if (account?.provider === "google") {
    //     try {
    //       const existingUser = await prisma.user.findUnique({
    //         where: { email: user.email! },
    //         select: { blocked: true, blockedUntil: true, provider: true },
    //       });
    //       if (existingUser?.blocked) {
    //         const isStillBlocked = existingUser.blockedUntil
    //           ? new Date(existingUser.blockedUntil) > new Date()
    //           : true;
    //         if (isStillBlocked) return false;
    //       }
    //       if (existingUser && !existingUser.provider) {
    //         await prisma.user.update({
    //           where: { email: user.email! },
    //           data: {
    //             provider: "google",
    //             providerId: account.providerAccountId,
    //             name: user.name || profile?.name || null,
    //             image: user.image || profile?.picture || null,
    //             emailVerified: true,
    //           },
    //         });
    //       }
    //     } catch (e) {
    //       console.error("[auth] signIn callback error:", e);
    //     }
    //   }
    //   return true;
    // },
    async session({ session }: any) {
      // Enriquece la sesión con userId y role desde la DB (para OAuth/Google cuando se reactive).
      // NO escribir en la cookie "session": la app usa esa cookie para el token de sesión (UUID)
      // en lib/session.ts; si aquí ponemos dbUser.id, se sobrescribe el token y al volver
      // (p. ej. Panel → Ver web → Panel) getSessionFromToken() falla y pide login de nuevo.
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
  // events para OAuth (Google): descomentar al reactivar Google
  // events: {
  //   async createUser({ user }: any) {
  //     if (user.email) {
  //       try {
  //         await prisma.user.update({
  //           where: { email: user.email },
  //           data: { role: "BUYER", emailVerified: true },
  //         });
  //       } catch (error) {
  //         console.error("Error setting default role for OAuth user:", error);
  //       }
  //     }
  //   },
  // },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
});
