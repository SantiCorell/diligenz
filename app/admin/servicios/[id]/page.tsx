import AdminServicioTools from "@/components/admin/AdminServicioTools";
import ServicioResumen from "@/components/servicios/panel/ServicioResumen";
import { loadAdminServiceView } from "@/lib/client-service-view";

export default async function AdminServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = await loadAdminServiceView(id);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminServicioTools
        serviceId={view.serviceId}
        title={view.title}
        priceEur={view.priceEur}
        summary={view.summary}
        status={view.status}
        accepted={view.accepted}
        documentsUrl={view.documentsUrl}
        invoicesUrl={view.invoicesUrl}
        clientName={view.clientName}
      />
      <ServicioResumen
        {...view}
        active="servicio"
        editable
        showBack
        backHref="/admin/servicios"
        backLabel="← Volver al tablero de servicios"
      />
    </div>
  );
}
