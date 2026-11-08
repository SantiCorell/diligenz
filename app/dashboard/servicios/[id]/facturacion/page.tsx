import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { loadClientServiceView } from "@/lib/client-service-view";
import ServicioResumen from "@/components/servicios/panel/ServicioResumen";

export default async function ClientServiceFacturacionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  const { id } = await params;
  const view = await loadClientServiceView(session.user.id, session.user.email, id);

  return (
    <div className="mx-auto max-w-6xl">
      <ServicioResumen {...view} active="facturacion" />
    </div>
  );
}