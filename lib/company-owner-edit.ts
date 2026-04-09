import { prisma } from "@/lib/prisma";

/**
 * El vendedor (dueño) no puede editar ficha, valoración ni archivos una vez el deal está publicado.
 * El administrador sí puede.
 */
export async function canOwnerEditCompanyListing(
  companyId: string,
  userId: string
): Promise<boolean> {
  const [company, user] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true, removedAt: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
  ]);
  if (!company || !user || company.removedAt) return false;
  if (user.role === "ADMIN") return true;
  if (company.ownerId !== userId) return false;
  const published = await prisma.deal.findFirst({
    where: { companyId, published: true },
    select: { id: true },
  });
  return !published;
}
