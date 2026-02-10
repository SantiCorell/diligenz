import { redirect } from "next/navigation";
import { getDisplayName } from "@/lib/user-display";
import { getSessionWithUser } from "@/lib/session";
import DashboardShell from "@/components/layout/DashboardShell";
import ProfileStatus from "@/components/dashboard/ProfileStatus";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const user = session.user;

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
