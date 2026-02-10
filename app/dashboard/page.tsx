import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import DashboardRedirect from "./DashboardRedirect";

export default async function DashboardRouter() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const { user } = session;
  if (user.role !== "SELLER" && user.role !== "BUYER" && user.role !== "ADMIN") {
    redirect("/login");
  }

  return <DashboardRedirect role={user.role} />;
}
