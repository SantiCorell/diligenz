import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import DashboardShell from "@/components/layout/DashboardShell";
import ProfileStatus from "@/components/dashboard/ProfileStatus";

const SESSION_MAX_AGE = 60 * 30; // 30 min

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) redirect("/login");

  // Renovar cookie para sesión deslizante (cada visita al panel extiende 30 min)
  cookieStore.set("session", session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.value },
    });
  } catch {
    redirect("/error");
  }

  if (!user) redirect("/login");

  const profileComplete = Boolean(user.phone);
  const userDisplayName = getDisplayName(user.email);

  return (
    <DashboardShell role={user.role} userDisplayName={userDisplayName}>
      {/* PERFIL (SIEMPRE ARRIBA) */}
      <div className="mb-8">
        <ProfileStatus
          emailVerified={user.emailVerified}
          ndaSigned={user.ndaSigned}
          dniVerified={user.dniVerified}
          profileComplete={profileComplete}
        />
      </div>

      {children}
    </DashboardShell>
  );
}
