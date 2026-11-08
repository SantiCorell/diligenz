import { prisma } from "@/lib/prisma";
import { getAgentCardById, getDashboardAgent, getDefaultAgentCard } from "@/lib/agents";
import { isConstitucionRequest } from "@/lib/servicios-panel";

export async function loadServiciosContext(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const [requests, agentContext, user] = await Promise.all([
    prisma.contactRequest.findMany({
      where: {
        source: "servicios",
        OR: [{ userId }, { email: normalized }],
      },
      orderBy: { createdAt: "desc" },
    }),
    getDashboardAgent(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { documentsDriveFolderUrl: true, name: true, servicesAgentId: true },
    }),
  ]);

  const constitucion = requests.find((request) =>
    isConstitucionRequest(request.subject, request.message)
  );

  return {
    requests,
    constitucion: constitucion ?? null,
    agent:
      (await getAgentCardById(user?.servicesAgentId)) ??
      agentContext.agent ??
      (await getDefaultAgentCard()),
    driveUrl: user?.documentsDriveFolderUrl?.trim() || null,
  };
}
