import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_MAX_AGE = 60 * 30; // 30 min

export default async function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/login");

  // Renovar cookie para sesión deslizante
  cookieStore.set("session", session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return <>{children}</>;
}
