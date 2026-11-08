import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { loadServiciosContext } from "@/lib/servicios-panel-data";
import { loadIntakeSnapshot } from "@/lib/service-intake-load";
import ConstitucionServicio from "@/components/servicios/panel/ConstitucionServicio";

export default async function ServiciosFacturacionPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  const { constitucion, agent, driveUrl } = await loadServiciosContext(session.user.id, session.user.email);

  if (!constitucion) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-extrabold text-[var(--brand-dark)]">Facturación</h1>
        <p className="text-sm text-[var(--foreground)]/65">Todavía no hay un servicio contratado.</p>
        <Link href="/servicios/constitucion-sl" className="inline-flex text-sm font-semibold text-[var(--brand-primary)]">
          Solicitar la constitución
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <ConstitucionServicio
        requestId={constitucion.id}
        agent={agent}
        driveUrl={driveUrl}
        active="facturacion"
        intake={await loadIntakeSnapshot({ contactRequestId: constitucion.id })}
      />
    </div>
  );
}