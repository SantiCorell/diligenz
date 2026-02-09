import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  if (user.role === "SELLER") {
    redirect("/dashboard/seller");
  }

  if (user.role === "BUYER") {
    redirect("/dashboard/buyer");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/login");
}
