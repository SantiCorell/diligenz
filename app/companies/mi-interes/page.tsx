import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/session";

/** Compatibilidad: el listado vive en el panel (mis empresas). */
export default async function MiInteresPage() {
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/login?from=/companies/mi-interes");
  redirect("/dashboard/mis-empresas");
}
