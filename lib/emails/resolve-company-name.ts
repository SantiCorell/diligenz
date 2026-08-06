import { prisma } from "@/lib/prisma";
import { publicListingName } from "@/lib/company-display-names";

/**
 * Nombre seguro para correos al comprador: solo el título público de la ficha.
 * Nunca el nombre real (`Company.name`), para no romper la confidencialidad.
 */
export async function resolveCompanyDisplayName(companyId: string): Promise<string> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      deals: {
        where: { published: true },
        select: { title: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const dealTitle = company?.deals[0]?.title;
  // Fallback genérico: no pasar Company.name (evita filtrar identidad real).
  return publicListingName(dealTitle, "Proyecto confidencial");
}
