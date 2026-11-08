import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentStepIndex, formatServicePrice } from "@/lib/client-services";
import { loadServiciosContext } from "@/lib/servicios-panel-data";
import { isConstitucionService, servicioExpediente } from "@/lib/servicios-panel";
import { loadIntakeSnapshot } from "@/lib/service-intake-load";

export async function loadClientServiceView(userId: string, email: string, serviceId: string) {
  const [service, context] = await Promise.all([
    prisma.clientService.findFirst({
      where: { id: serviceId, userId },
      include: {
        steps: {
          orderBy: { position: "asc" },
          include: { documents: { orderBy: { createdAt: "desc" }, select: { id: true, name: true } } },
        },
      },
    }),
    loadServiciosContext(userId, email),
  ]);
  if (!service) notFound();

  const showSlDetails = isConstitucionService(service.title, service.summary);
  const intake = showSlDetails
    ? await loadIntakeSnapshot({ clientServiceId: service.id, contactRequestId: service.contactRequestId })
    : null;
  const steps = service.steps.map((step) => ({
    id: step.id,
    title: step.title,
    done: step.done,
    documents: step.documents,
  }));
  const badge =
    service.status === "COMPLETED" ? "Finalizada" : service.status === "DISCARDED" ? "Descartada" : "En trámite";

  return {
    tabs: {
      servicio: `/dashboard/servicios/${service.id}`,
      documentos: `/dashboard/servicios/${service.id}/documentos`,
      facturacion: `/dashboard/servicios/${service.id}/facturacion`,
    },
    title: service.title,
    expediente: showSlDetails
      ? `${servicioExpediente(service.contactRequestId || service.id)} · Procedimiento CIRCE / PAE`
      : servicioExpediente(service.id),
    badge,
    steps,
    currentIndex: currentStepIndex(steps),
    priceLabel: formatServicePrice(service.priceEur),
    priceCaption: service.summary?.trim() || "Honorarios del servicio",
    showSlDetails,
    agent: context.agent,
    documentsUrl: service.documentsUrl?.trim() || null,
    invoicesUrl: service.invoicesUrl?.trim() || null,
    acceptServiceId: service.status === "PROPOSAL" ? service.id : null,
    intake,
    serviceId: service.id,
    userId: service.userId,
  };
}

export async function loadAdminServiceView(serviceId: string) {
  const service = await prisma.clientService.findUnique({
    where: { id: serviceId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      steps: {
        orderBy: { position: "asc" },
        include: { documents: { orderBy: { createdAt: "desc" }, select: { id: true, name: true } } },
      },
    },
  });
  if (!service) notFound();
  const view = await loadClientServiceView(service.userId, service.user.email, service.id);
  return {
    ...view,
    acceptServiceId: null,
    priceEur: service.priceEur,
    status: service.status,
    accepted: service.acceptedAt != null,
    summary: service.summary,
    clientName: service.user.name || service.user.email,
  };
}
