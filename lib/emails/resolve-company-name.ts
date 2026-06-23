import { prisma } from "@/lib/prisma";
import { MOCK_COMPANIES } from "@/lib/mock-companies";

export async function resolveCompanyDisplayName(companyId: string): Promise<string> {
  const mock = MOCK_COMPANIES.find((c) => c.id === companyId);
  if (mock) return mock.name;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });
  return company?.name ?? "la empresa seleccionada";
}
