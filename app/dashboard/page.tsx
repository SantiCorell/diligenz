import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardRedirect from "./DashboardRedirect";

/**
 * Página índice del dashboard: redirige según el rol.
 * Usamos redirección en cliente (DashboardRedirect) en lugar de redirect()
 * en servidor para que la cookie de sesión que renueva el layout se envíe
 * en la respuesta. Con redirect() en servidor, esa cookie se pierde y al
 * volver al panel la sesión parece expirada.
 */
export default async function DashboardRouter() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SELLER" && user.role !== "BUYER" && user.role !== "ADMIN") {
    redirect("/login");
  }

  return <DashboardRedirect role={user.role} />;
}
