import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import AdminShell from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { email: true, role: true },
  });

  if (!user || user.role !== "ADMIN") redirect("/login");

  const userDisplayName = getDisplayName(user.email);

  return (
    <AdminShell userDisplayName={userDisplayName}>
      {children}
    </AdminShell>
  );
}
