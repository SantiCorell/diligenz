import { redirect } from "next/navigation";
import { getDisplayName } from "@/lib/user-display";
import { getUserDniPendingReview } from "@/lib/user-documents/dni-status";
import { isUserProfileComplete } from "@/lib/user-profile-complete";
import { getSessionWithUser } from "@/lib/session";
import DashboardShell from "@/components/layout/DashboardShell";
import HideOnServicios from "@/components/dashboard/HideOnServicios";
import ProfileStatus from "@/components/dashboard/ProfileStatus";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const user = session.user;

  const profileComplete = isUserProfileComplete(user);
  const dniPendingReview = await getUserDniPendingReview(user.id, user.dniVerified);
  const userDisplayName =
    user.name?.trim() || getDisplayName(user.email);

  return (
    <DashboardShell role={user.role} userDisplayName={userDisplayName}>
      {/* PERFIL (SIEMPRE ARRIBA) */}
      {user.role !== "ADMIN" && (
        <HideOnServicios>
          <ProfileStatus
            variant="banner"
            ndaSigned={user.ndaSigned}
            dniVerified={user.dniVerified}
            dniPendingReview={dniPendingReview}
            profileComplete={profileComplete}
            userName={user.name}
            userPhone={user.phone}
            role={user.role}
          />
        </HideOnServicios>
      )}

      {children}
    </DashboardShell>
  );
}
