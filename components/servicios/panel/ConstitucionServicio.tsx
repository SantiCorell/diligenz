import type { AgentCardData } from "@/lib/agent-shared";
import type { IntakeSnapshot } from "@/lib/service-intake";
import { DILIGENZ_SL_FEE, SL_STEPS, servicioExpediente } from "@/lib/servicios-panel";
import ServicioResumen from "./ServicioResumen";

export default function ConstitucionServicio({
  requestId,
  agent,
  driveUrl,
  showBack = true,
  active = "servicio",
  intake,
}: {
  requestId: string;
  agent: AgentCardData | null;
  driveUrl: string | null;
  showBack?: boolean;
  active?: "servicio" | "documentos" | "facturacion";
  intake: IntakeSnapshot;
}) {
  return (
    <ServicioResumen
      tabs={{
        servicio: "/dashboard/servicios/constitucion",
        documentos: "/dashboard/servicios/documentos",
        facturacion: "/dashboard/servicios/facturacion",
      }}
      active={active}
      title="Constitución de sociedad limitada"
      expediente={`${servicioExpediente(requestId)} · Procedimiento CIRCE / PAE`}
      badge="En trámite"
      steps={SL_STEPS.map((title) => ({ title, done: false }))}
      currentIndex={0}
      priceLabel={DILIGENZ_SL_FEE}
      priceCaption="Tramitación completa, de principio a fin"
      showSlDetails
      agent={agent}
      documentsUrl={driveUrl}
      invoicesUrl={null}
      showBack={showBack}
      intake={intake}
    />
  );
}
