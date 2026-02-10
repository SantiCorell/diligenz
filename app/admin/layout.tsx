import { redirect } from "next/navigation";
import { getDisplayName } from "@/lib/user-display";
import { getSessionWithUser } from "@/lib/session";
import AdminShell from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const user = session.user;
  if (user.role !== "ADMIN") redirect("/login");

  const userDisplayName = getDisplayName(user.email);

  return (
    <AdminShell userDisplayName={userDisplayName}>
      {children}
    </AdminShell>
  );
}
