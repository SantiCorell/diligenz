/**
 * Elimina las empresas demo locales (marcadas con __LOCAL_DEMO__).
 * Uso: npm run db:seed:local-demo:clean
 */
import { PrismaClient } from "@prisma/client";

const DEMO_MARKER = "__LOCAL_DEMO__";

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  const lower = url.toLowerCase();
  const isLocal =
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.includes("@host.docker.internal");
  if (!isLocal) {
    console.error("Abortado: DATABASE_URL no parece local.");
    process.exit(1);
  }
}

async function main() {
  assertLocalDatabase();
  const prisma = new PrismaClient();

  try {
    const existing = await prisma.company.findMany({
      where: { sellerDocumentsNote: DEMO_MARKER },
      select: { id: true, reference: true, name: true },
    });

    if (existing.length === 0) {
      console.log("No hay empresas demo locales que borrar.");
      return;
    }

    const ids = existing.map((c) => c.id);
    await prisma.userCompanyInterest.deleteMany({ where: { companyId: { in: ids } } });
    await prisma.deal.deleteMany({ where: { companyId: { in: ids } } });
    await prisma.valuation.deleteMany({ where: { companyId: { in: ids } } });
    await prisma.company.deleteMany({ where: { id: { in: ids } } });

    console.log(`Eliminadas ${existing.length} empresas demo:`);
    for (const c of existing) {
      console.log(`  • ${c.reference ?? "—"}  ${c.name}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
