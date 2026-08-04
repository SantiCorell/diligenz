/**
 * Crea empresas de demostración SOLO en base de datos local.
 *
 * Uso: npm run db:seed:local-demo
 *
 * Seguridad: aborta si DATABASE_URL no apunta a localhost/127.0.0.1.
 * Las empresas se marcan con sellerDocumentsNote = '__LOCAL_DEMO__' para poder borrarlas.
 */
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const DEMO_MARKER = "__LOCAL_DEMO__";

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

/** Datos ficticios para probar listado, destacadas, filtros y tarjetas. */
const DEMO_COMPANIES = [
  {
    dealTitle: "Franquicia de telecomunicaciones (fibra y móvil)",
    name: "Telecom Retail Madrid SL",
    sector: "retail-comercio",
    location: "madrid",
    revenue: "55000",
    ebitda: "20000",
    exerciseResult: null,
    employees: 1,
    description:
      "Oportunidad de adquisición de franquicia de telecomunicaciones ubicada en una zona residencial céntrica en Madrid. La tienda opera bajo una marca reconocida.",
    yearsOperating: 4,
    companyType: "EMPRESA",
    featured: true,
    hideSalePrice: true,
  },
  {
    dealTitle: "Taller de Carrocerías",
    name: "Carrocerías Levante SL",
    sector: "servicios-profesionales-b2b",
    location: "comunidad-valenciana",
    revenue: "575000",
    ebitda: null,
    exerciseResult: null,
    employees: 8,
    description:
      "Empresa consolidada en el sector de la reparación de carrocerías para flotas de vehículos, con más de cuatro décadas de actividad y una cartera estable.",
    yearsOperating: 42,
    companyType: "EMPRESA",
    featured: true,
    saleOverride: { min: 200000, max: 200000 },
  },
  {
    dealTitle: "SaaS de analítica industrial",
    name: "CloudMetrics Iberia SL",
    sector: "tecnologia-software-saas",
    location: "madrid",
    revenue: "2400000",
    ebitda: "480000",
    exerciseResult: "310000",
    employees: 28,
    description:
      "Plataforma SaaS de analítica para pymes industriales. MRR estable, churn bajo y base de clientes en España y Portugal.",
    yearsOperating: 7,
    companyType: "EMPRESA",
    featured: true,
  },
  {
    dealTitle: "Cadena de restauración mediterránea",
    name: "Grupo Sabores del Levante SL",
    sector: "hosteleria-restauracion",
    location: "comunidad-valenciana",
    revenue: "1850000",
    ebitda: "220000",
    exerciseResult: "145000",
    employees: 42,
    description:
      "Cadena de tres restaurantes de cocina mediterránea en Valencia capital. Localización prime y equipo de sala consolidado.",
    yearsOperating: 12,
    companyType: "EMPRESA",
    featured: true,
  },
  {
    dealTitle: "Distribuidora farmacéutica regional",
    name: "Distribuciones FarmaCat SL",
    sector: "farma",
    location: "cataluna",
    revenue: "5200000",
    ebitda: "610000",
    exerciseResult: "420000",
    employees: 35,
    description:
      "Distribuidor regional de productos farmacéuticos y parafarmacia. Contratos con laboratorios nacionales y red logística propia.",
    yearsOperating: 18,
    companyType: "EMPRESA",
    featured: false,
  },
  {
    dealTitle: "Utillaje de precisión para automoción",
    name: "Precision Tools Bilbao SL",
    sector: "industria-manufactura",
    location: "pais-vasco",
    revenue: "3100000",
    ebitda: "390000",
    exerciseResult: "255000",
    employees: 55,
    description:
      "Fabricación de utillaje de precisión para automoción y aeronáutica. Certificación ISO y cartera de clientes B2B recurrente.",
    yearsOperating: 22,
    companyType: "EMPRESA",
    featured: false,
  },
  {
    dealTitle: "Consultoría de transformación digital",
    name: "Consulting Partners Andalucía SL",
    sector: "servicios-profesionales-b2b",
    location: "andalucia",
    revenue: "980000",
    ebitda: "145000",
    exerciseResult: null,
    employees: 14,
    description:
      "Consultoría de procesos y transformación digital para pymes. Modelo híbrido con proyectos recurrentes de mantenimiento.",
    yearsOperating: 9,
    companyType: "EMPRESA",
    featured: false,
    hideSalePrice: true,
  },
  {
    dealTitle: "Retail de moda urbana multicanal",
    name: "Moda Urbana Retail SL",
    sector: "retail-comercio",
    location: "madrid",
    revenue: "4200000",
    ebitda: "310000",
    exerciseResult: "180000",
    employees: 68,
    description:
      "Retail multicanal de moda urbana con tienda flagship y e-commerce. Marca propia reconocida en el segmento 25-40 años.",
    yearsOperating: 11,
    companyType: "EMPRESA",
    featured: false,
  },
  {
    dealTitle: "Operador logístico con flota propia",
    name: "TransLog Aragón SL",
    sector: "logistica-transporte",
    location: "aragon",
    revenue: "6700000",
    ebitda: "520000",
    exerciseResult: "390000",
    employees: 88,
    description:
      "Operador logístico con flota propia y almacén cross-docking en Zaragoza. Contratos plurianuales con retail y alimentación.",
    yearsOperating: 15,
    companyType: "EMPRESA",
    featured: true,
  },
  {
    dealTitle: "Bootcamp y formación profesional tech",
    name: "Academia Digital Formación SL",
    sector: "educacion-formacion",
    location: "madrid",
    revenue: "1250000",
    ebitda: "180000",
    exerciseResult: "95000",
    employees: 22,
    description:
      "Centro de formación profesional y bootcamps tech. Alta tasa de colocación laboral y contenidos propios digitales.",
    yearsOperating: 6,
    companyType: "EMPRESA",
    featured: false,
  },
  {
    dealTitle: "Clínica dental con dos centros",
    name: "Clínicas Sonrisa Norte SL",
    sector: "salud-bienestar",
    location: "galicia",
    revenue: "2100000",
    ebitda: "370000",
    exerciseResult: "240000",
    employees: 19,
    description:
      "Dos clínicas dentales en A Coruña con cartera de pacientes fidelizada, equipamiento renovado y equipo médico estable.",
    yearsOperating: 14,
    companyType: "EMPRESA",
    featured: false,
  },
  {
    dealTitle: "Agencia de marketing digital B2B",
    name: "Pulse Growth Agency SL",
    sector: "tecnologia-software-saas",
    location: "cataluna",
    revenue: "780000",
    ebitda: "160000",
    exerciseResult: null,
    employees: 11,
    description:
      "Agencia boutique de performance y contenido B2B. Retainer mensual con startups y scale-ups industriales.",
    yearsOperating: 5,
    companyType: "EMPRESA",
    featured: false,
    hideSalePrice: true,
  },
  {
    dealTitle: "Farmacia de barrio con parking",
    name: "Farmacia Barrio Norte CB",
    sector: "farma",
    location: "madrid",
    revenue: "1450000",
    ebitda: "210000",
    exerciseResult: "155000",
    employees: 6,
    description:
      "Farmacia consolidada en zona residencial con parking propio, alta afluencia y margen estable en parafarmacia.",
    yearsOperating: 20,
    companyType: "EMPRESA",
    featured: true,
  },
  {
    dealTitle: "Empresa de limpieza industrial",
    name: "Limpiezas Industriales Sur SL",
    sector: "servicios-profesionales-b2b",
    location: "andalucia",
    revenue: "2600000",
    ebitda: "290000",
    exerciseResult: "175000",
    employees: 74,
    description:
      "Servicios de limpieza industrial y facility para polígonos y oficinas. Contratos recurrentes y personal propio.",
    yearsOperating: 16,
    companyType: "EMPRESA",
    featured: false,
  },
];

function estimateValuation(revenueStr, ebitdaStr) {
  const revenue = Number.parseInt(revenueStr, 10) || 1_000_000;
  const ebitda = ebitdaStr
    ? Number.parseInt(ebitdaStr, 10)
    : Math.round(revenue * 0.12);
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
  // Favoritos / ficheros si existen en el schema
  if (prisma.companyFavorite?.deleteMany) {
    await prisma.companyFavorite.deleteMany({ where: { companyId: { in: ids } } });
  }
  if (prisma.companyFile?.deleteMany) {
    await prisma.companyFile.deleteMany({ where: { companyId: { in: ids } } });
  }
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
    let featuredCount = 0;

    for (let i = 0; i < DEMO_COMPANIES.length; i++) {
      const row = DEMO_COMPANIES[i];
      const reference = `DEMO-${1013 + i}`;
      const estimated = estimateValuation(row.revenue, row.ebitda);
      const salePriceMin = row.hideSalePrice
        ? null
        : row.saleOverride?.min ?? estimated.salePriceMin;
      const salePriceMax = row.hideSalePrice
        ? null
        : row.saleOverride?.max ?? estimated.salePriceMax;

      const company = await prisma.company.create({
        data: {
          name: row.name,
          sector: row.sector,
          location: row.location,
          revenue: row.revenue,
          ebitda: row.ebitda,
          exerciseResult: row.exerciseResult,
          employees: row.employees,
          description: row.description,
          sellerDescription: `Descripción ampliada (demo local): ${row.description}`,
          status: "PUBLISHED",
          companyType: row.companyType,
          yearsOperating: row.yearsOperating,
          reference,
          sellerDocumentsNote: DEMO_MARKER,
          ownerId: owner.id,
          featuredAt: row.featured ? new Date() : null,
        },
      });

      await prisma.valuation.create({
        data: {
          companyId: company.id,
          minValue: estimated.minValue,
          maxValue: estimated.maxValue,
          salePriceMin,
          salePriceMax,
        },
      });

      const slug = slugFor(row.sector, row.location, company.id);
      const deal = await prisma.deal.create({
        data: {
          title: row.dealTitle,
          slug: `${slug}-${createHash("sha1").update(company.id).digest("hex").slice(0, 6)}`,
          published: true,
          companyId: company.id,
        },
      });

      if (row.featured) featuredCount += 1;

      created.push({
        id: company.id,
        reference,
        dealTitle: deal.title,
        sector: row.sector,
        featured: Boolean(row.featured),
      });
    }

    console.log(
      `\n✓ ${created.length} empresas demo creadas (${featuredCount} destacadas):\n`
    );
    for (const c of created) {
      console.log(
        `  ${c.featured ? "★" : "·"} ${c.reference}  ${c.dealTitle}  →  /companies/${c.id}`
      );
    }
    console.log("\nVer catálogo: http://localhost:3000/companies");
    console.log("Home destacadas: http://localhost:3000/");
    console.log("Para borrarlas: npm run db:seed:local-demo:clean");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
