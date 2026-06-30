import { prisma } from "@/lib/prisma";

export async function resolveCompanyDisplayName(companyId: string): Promise<string> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });
  return company?.name ?? "la empresa seleccionada";
}
