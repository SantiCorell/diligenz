import { prisma } from "@/lib/prisma";

type SessionLike = { user: { id: string; email: string; role: string } };

export async function resolveIntakeTarget(
  session: SessionLike,
  input: { clientServiceId?: unknown; contactRequestId?: unknown }
) {
  const clientServiceId = typeof input.clientServiceId === "string" && input.clientServiceId ? input.clientServiceId : null;
  const contactRequestId = typeof input.contactRequestId === "string" && input.contactRequestId ? input.contactRequestId : null;
  if (!clientServiceId && !contactRequestId) {
    return { error: "Falta el expediente.", status: 400 as const };
  }

  if (clientServiceId) {
    const service = await prisma.clientService.findUnique({
      where: { id: clientServiceId },
      select: { id: true, userId: true, contactRequestId: true },
    });
    if (!service) return { error: "Servicio no encontrado.", status: 404 as const };
    if (session.user.role !== "ADMIN" && service.userId !== session.user.id) {
      return { error: "No autorizado", status: 403 as const };
    }
    return {
      userId: service.userId,
      clientServiceId: service.id,
      contactRequestId: service.contactRequestId ?? contactRequestId,
    };
  }

  const request = await prisma.contactRequest.findUnique({
    where: { id: contactRequestId! },
    select: { id: true, userId: true, email: true, source: true },
  });
  if (!request || request.source !== "servicios") {
    return { error: "Solicitud no encontrada.", status: 404 as const };
  }
  const owns =
    request.userId === session.user.id ||
    request.email.trim().toLowerCase() === session.user.email.trim().toLowerCase();
  if (session.user.role !== "ADMIN" && !owns) {
    return { error: "No autorizado", status: 403 as const };
  }

  let userId = request.userId;
  if (!userId && owns) {
    await prisma.contactRequest.update({ where: { id: request.id }, data: { userId: session.user.id } });
    userId = session.user.id;
  }
  if (!userId) return { error: "Esta solicitud todavía no está vinculada a una cuenta.", status: 400 as const };

  return { userId, clientServiceId: null, contactRequestId: request.id };
}
