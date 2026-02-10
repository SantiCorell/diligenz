import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/session";

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/login");
  return <>{children}</>;
}
