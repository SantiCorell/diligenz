import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/login");

  return <>{children}</>;
}
