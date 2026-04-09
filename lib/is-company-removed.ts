import { prisma } from "@/lib/prisma";

/** true si no existe o tiene borrado lógico (removedAt). */
export async function isCompanyRemoved(companyId: string): Promise<boolean> {
  const c = await prisma.company.findUnique({
    where: { id: companyId },
    select: { removedAt: true },
  });
  return !c || c.removedAt != null;
}
