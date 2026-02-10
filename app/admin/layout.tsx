import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import AdminShell from "@/components/layout/AdminShell";

const SESSION_MAX_AGE = 60 * 30; // 30 min

export default async function AdminLayout({
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
