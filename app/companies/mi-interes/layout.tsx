import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import DashboardShell from "@/components/layout/DashboardShell";
import ProfileStatus from "@/components/dashboard/ProfileStatus";

export default async function MiInteresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.value },
  });

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
