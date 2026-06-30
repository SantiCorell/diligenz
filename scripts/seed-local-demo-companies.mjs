/**
 * Crea 8 empresas de demostración SOLO en base de datos local.
 *
 * Uso: npm run db:seed:local-demo
 *
 * Seguridad: aborta si DATABASE_URL no apunta a localhost/127.0.0.1.
 * Las empresas se marcan con sellerDocumentsNote = '__LOCAL_DEMO__' para poder borrarlas.
 */
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const DEMO_MARKER = "__LOCAL_DEMO__";
const DEMO_COUNT = 8;

const PROJECT_NAMES = [
  "Atlas",
  "Orion",
  "Nexus",
  "Helios",
  "Aurora",
  "Delta",
  "Titan",
  "Vega",
];

function generateDealTitle(index) {
  const name = PROJECT_NAMES[index % PROJECT_NAMES.length];
  const suffix = String(1000 + index);
  return `Proyecto ${name} ${suffix}`;
}

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  const lower = url.toLowerCase();
  const isLocal =
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.includes("@host.docker.internal");
  if (!isLocal) {
    console.error(
      "Abortado: DATABASE_URL no parece local.\n" +
        "Este script solo debe ejecutarse contra tu Postgres de desarrollo.\n" +
        `URL actual: ${url.replace(/:[^:@/]+@/, ":****@")}`
    );
    process.exit(1);
  }
}

function slugFor(sector, location, companyId) {
  return `${sector}-${location}-${companyId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Datos ficticios variados para probar filtros y fichas. */
const DEMO_COMPANIES = [
  {
    name: "CloudMetrics Iberia SL",
    sector: "tecnologia-software-saas",
    location: "madrid",
    revenue: "2400000",
    ebitda: "480000",
    employees: 28,
    description:
      "Plataforma SaaS de analítica para pymes industriales. MRR estable, churn bajo y base de clientes en España y Portugal.",
    yearsOperating: 7,
    companyType: "EMPRESA",
  },
  {
    name: "Grupo Sabores del Levante SL",
    sector: "hosteleria-restauracion",
    location: "valencia",
    revenue: "1850000",
    ebitda: "220000",
    employees: 42,
    description:
      "Cadena de tres restaurantes de cocina mediterránea en Valencia capital. Localización prime y equipo de sala consolidado.",
    yearsOperating: 12,
    companyType: "EMPRESA",
  },
  {
    name: "Distribuciones FarmaCat SL",
    sector: "farma",
    location: "cataluna",
    revenue: "5200000",
    ebitda: "610000",
    employees: 35,
    description:
      "Distribuidor regional de productos farmacéuticos y parafarmacia. Contratos con laboratorios nacionales y red logística propia.",
    yearsOperating: 18,
    companyType: "EMPRESA",
  },
  {
    name: "Precision Tools Bilbao SL",
    sector: "industria-manufactura",
    location: "pais-vasco",
    revenue: "3100000",
    ebitda: "390000",
    employees: 55,
    description:
      "Fabricación de utillaje de precisión para automoción y aeronáutica. Certificación ISO y cartera de clientes B2B recurrente.",
    yearsOperating: 22,
    companyType: "EMPRESA",
  },
  {
    name: "Consulting Partners Andalucía SL",
    sector: "servicios-profesionales-b2b",
    location: "andalucia",
    revenue: "980000",
    ebitda: "145000",
    employees: 14,
    description:
      "Consultoría de procesos y transformación digital para pymes. Modelo híbrido con proyectos recurrentes de mantenimiento.",
    yearsOperating: 9,
    companyType: "EMPRESA",
  },
  {
    name: "Moda Urbana Retail SL",
    sector: "retail-comercio",
    location: "madrid",
    revenue: "4200000",
    ebitda: "310000",
    employees: 68,
    description:
      "Retail multicanal de moda urbana con tienda flagship y e-commerce. Marca propia reconocida en el segmento 25-40 años.",
    yearsOperating: 11,
    companyType: "EMPRESA",
  },
  {
    name: "TransLog Aragón SL",
    sector: "logistica-transporte",
    location: "aragon",
    revenue: "6700000",
    ebitda: "520000",
    employees: 88,
    description:
      "Operador logístico con flota propia y almacén cross-docking en Zaragoza. Contratos plurianuales con retail y alimentación.",
    yearsOperating: 15,
    companyType: "EMPRESA",
  },
  {
    name: "Academia Digital Formación SL",
    sector: "educacion-formacion",
    location: "madrid",
    revenue: "1250000",
    ebitda: "180000",
    employees: 22,
    description:
      "Centro de formación profesional y bootcamps tech. Alta tasa de colocación laboral y contenidos propios digitales.",
    yearsOperating: 6,
    companyType: "EMPRESA",
  },
];

function estimateValuation(revenueStr, ebitdaStr) {
  const revenue = Number.parseInt(revenueStr, 10) || 1_000_000;
  const ebitda = ebitdaStr ? Number.parseInt(ebitdaStr, 10) : Math.round(revenue * 0.12);
  const minValue = Math.round(Math.max(ebitda * 3.5, revenue * 0.35));
  const maxValue = Math.round(Math.max(ebitda * 5.5, revenue * 0.55));
  const salePriceMin = Math.round(minValue * 0.92);
  const salePriceMax = Math.round(maxValue * 1.05);
  return { minValue, maxValue, salePriceMin, salePriceMax };
}

async function resolveOwnerId(prisma) {
  const preferred = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      role: { in: ["ADMIN", "SELLER", "PROFESSIONAL"] },
      blocked: false,
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true },
  });
  if (preferred) return preferred;

  const anyUser = await prisma.user.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true },
  });
  if (anyUser) return anyUser;

  console.error("No hay usuarios en la base local. Crea uno antes de ejecutar el seed.");
  process.exit(1);
}

async function removePreviousDemoCompanies(prisma) {
  const existing = await prisma.company.findMany({
    where: { sellerDocumentsNote: DEMO_MARKER },
    select: { id: true, name: true },
  });
  if (existing.length === 0) return;

  const ids = existing.map((c) => c.id);
  await prisma.deal.deleteMany({ where: { companyId: { in: ids } } });
  await prisma.valuation.deleteMany({ where: { companyId: { in: ids } } });
  await prisma.company.deleteMany({ where: { id: { in: ids } } });
  console.log(`Eliminadas ${existing.length} empresas demo anteriores.`);
}

async function main() {
  assertLocalDatabase();
  const prisma = new PrismaClient();

  try {
    const owner = await resolveOwnerId(prisma);
    console.log(`Propietario demo: ${owner.email} (${owner.role})`);

    await removePreviousDemoCompanies(prisma);

    const created = [];

    for (let i = 0; i < DEMO_COMPANIES.length; i++) {
      const row = DEMO_COMPANIES[i];
      const reference = `DEMO-L${String(i + 1).padStart(2, "0")}`;
      const { minValue, maxValue, salePriceMin, salePriceMax } = estimateValuation(
        row.revenue,
        row.ebitda
      );

      const company = await prisma.company.create({
        data: {
          name: row.name,
          sector: row.sector,
          location: row.location,
          revenue: row.revenue,
          ebitda: row.ebitda,
          employees: row.employees,
          description: row.description,
          sellerDescription: `Descripción ampliada (demo local): ${row.description}`,
          status: "PUBLISHED",
          companyType: row.companyType,
          yearsOperating: row.yearsOperating,
          reference,
          sellerDocumentsNote: DEMO_MARKER,
          ownerId: owner.id,
        },
      });

      await prisma.valuation.create({
        data: {
          companyId: company.id,
          minValue,
          maxValue,
          salePriceMin,
          salePriceMax,
        },
      });

      const slug = slugFor(row.sector, row.location, company.id);
      const deal = await prisma.deal.create({
        data: {
          title: generateDealTitle(i),
          slug: `${slug}-${createHash("sha1").update(company.id).digest("hex").slice(0, 6)}`,
          published: true,
          companyId: company.id,
        },
      });

      created.push({
        id: company.id,
        reference,
        dealTitle: deal.title,
        sector: row.sector,
      });
    }

    console.log(`\n✓ ${created.length} empresas demo creadas y publicadas en local:\n`);
    for (const c of created) {
      console.log(`  • ${c.reference}  ${c.dealTitle}  →  /companies/${c.id}`);
    }
    console.log("\nVer catálogo: http://localhost:3000/companies");
    console.log("Para borrarlas: npm run db:seed:local-demo:clean");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
