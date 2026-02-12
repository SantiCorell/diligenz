import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";

const ROLE_TARGET: Record<string, string> = {
  SELLER: "/dashboard/seller",
  BUYER: "/dashboard/buyer",
  ADMIN: "/admin",
};

export default async function DashboardRouter() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const { user } = session;
  if (user.role !== "SELLER" && user.role !== "BUYER" && user.role !== "ADMIN") {
    redirect("/login");
  }

  // Redirección en servidor: una sola carga en lugar de "Redirigiendo..." + segunda navegación
  const target = ROLE_TARGET[user.role] ?? "/login";
  redirect(target);
}
