/**
 * Usuarios y solicitudes de demostración SOLO en Postgres local.
 * Uso: npx dotenv-cli -e .env.local -- node scripts/seed-local-portal-demo.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const MARKER = "__PORTAL_DEMO__";

const USERS = [
  {
    email: "admin@diligenz.test",
    password: "DiligenzAdmin26",
    name: "Admin Diligenz",
    phone: "600000001",
    role: "ADMIN",
    ndaSigned: true,
    dniVerified: true,
    profileVerifiedByAdmin: true,
  },
  {
    email: "comprador@diligenz.test",
    password: "DiligenzBuyer26",
    name: "Jose Ángel Demo",
    phone: "600000002",
    role: "BUYER",
    ndaSigned: false,
    dniVerified: false,
    profileVerifiedByAdmin: false,
  },
  {
    email: "vendedor@diligenz.test",
    password: "DiligenzSeller26",
    name: "Vendedor Demo",
    phone: "600000003",
    role: "SELLER",
    ndaSigned: true,
    dniVerified: true,
    profileVerifiedByAdmin: true,
  },
];

const COMPANIES = [
  {
    key: "tableros",
    dealTitle: "Especialista en tableros curvados",
    name: "Tableros Curvos Demo SL",
    sector: "industria-manufactura",
    location: "comunidad-valenciana",
    revenue: "1800000",
    ebitda: "310000",
    employees: 9,
    description: "Fabricación con cartera de clientes B2B consolidada en el sector del mueble y la construcción.",
    status: "PENDING_NDA",
    hoursAgo: 20,
  },
  {
    key: "farmacia",
    dealTitle: "Farmacia · Costa Valenciana",
    name: "Farmacia Costa Demo CB",
    sector: "farma",
    location: "comunidad-valenciana",
    revenue: "3200000",
    ebitda: "660000",
    employees: 13,
    description: "Oficina de farmacia de gran volumen en una localización turística de primer nivel de la Costa Valenciana.",
    status: "TEASER",
    hoursAgo: 6,
    teaser: true,
  },
  {
    key: "software",
    dealTitle: "Proyecto de software B2B",
    name: "Software B2B Demo SL",
    sector: "tecnologia-software-saas",
    location: "valencia",
    revenue: "900000",
    ebitda: "140000",
    employees: 11,
    description: "El proceso de esta operación se cerró antes de completarse la revisión.",
    status: "CLOSED",
    hoursAgo: 90,
  },
  {
    key: "cafe",
    dealTitle: "Ocho de Café La Colombiana Arábica",
    name: "Cafe Colombiana Demo SL",
    sector: "hosteleria-restauracion",
    location: "comunidad-valenciana",
    revenue: "740000",
    ebitda: "90000",
    employees: 6,
    description: "Tostador de café de especialidad con clientela local y venta online.",
    status: "IN_REVIEW",
    hoursAgo: 60,
  },
  {
    key: "taller",
    dealTitle: "Taller de carpintería metálica",
    name: "Carpinteria Metal Demo SL",
    sector: "industria-manufactura",
    location: "comunidad-valenciana",
    revenue: "1100000",
    ebitda: "160000",
    employees: 8,
    description: "Taller de carpintería metálica con encargos recurrentes de obra.",
    status: "CONVERSATIONS",
    hoursAgo: 30,
    teaser: true,
  },
  {
    key: "optica",
    dealTitle: "Óptica en Sevilla",
    name: "Optica Sevilla Demo SL",
    sector: "salud-bienestar",
    location: "andalucia",
    revenue: "640000",
    ebitda: "80000",
    employees: 4,
    description: "Óptica de barrio con clientela fiel y revisión visual.",
    status: "REJECTED",
    hoursAgo: 100,
  },
];

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  const lower = url.toLowerCase();
  if (!lower.includes("localhost") && !lower.includes("127.0.0.1")) {
    console.error("Abortado: este seed solo corre contra una base local.");
    process.exit(1);
  }
}

async function main() {
  assertLocalDatabase();
  const prisma = new PrismaClient();
  try {
    const users = {};
    for (const row of USERS) {
      const passwordHash = await bcrypt.hash(row.password, 10);
      users[row.role] = await prisma.user.upsert({
        where: { email: row.email },
        update: {
          passwordHash,
          name: row.name,
          phone: row.phone,
          role: row.role,
          accountStatus: "ACTIVE",
          ndaSigned: row.ndaSigned,
          dniVerified: row.dniVerified,
          profileVerifiedByAdmin: row.profileVerifiedByAdmin,
          deletedAt: null,
        },
        create: {
          email: row.email,
          passwordHash,
          name: row.name,
          phone: row.phone,
          role: row.role,
          accountStatus: "ACTIVE",
          ndaSigned: row.ndaSigned,
          dniVerified: row.dniVerified,
          profileVerifiedByAdmin: row.profileVerifiedByAdmin,
        },
      });
    }

    const previous = await prisma.company.findMany({
      where: { sellerDocumentsNote: MARKER },
      select: { id: true },
    });
    const previousIds = previous.map((c) => c.id);
    if (previousIds.length) {
      await prisma.userCompanyInterest.deleteMany({ where: { companyId: { in: previousIds } } });
      await prisma.deal.deleteMany({ where: { companyId: { in: previousIds } } });
      await prisma.valuation.deleteMany({ where: { companyId: { in: previousIds } } });
      await prisma.company.deleteMany({ where: { id: { in: previousIds } } });
    }

    const buyer = users.BUYER;
    let i = 0;
    for (const row of COMPANIES) {
      i += 1;
      const when = new Date(Date.now() - row.hoursAgo * 60 * 60 * 1000);
      const company = await prisma.company.create({
        data: {
          name: row.name,
          sector: row.sector,
          location: row.location,
          revenue: row.revenue,
          ebitda: row.ebitda,
          employees: row.employees,
          description: row.description,
          status: "PUBLISHED",
          reference: `DIL-${1040 + i}`,
          sellerDocumentsNote: MARKER,
          ownerId: users.SELLER.id,
          attachmentsApproved: Boolean(row.teaser),
          buyerDocuments: row.teaser
            ? [{ label: `Teaser · ${row.dealTitle}.pdf`, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }]
            : undefined,
          createdAt: when,
        },
      });
      await prisma.deal.create({
        data: {
          title: row.dealTitle,
          slug: `portal-demo-${row.key}`,
          published: true,
          companyId: company.id,
          createdAt: when,
        },
      });
      await prisma.userCompanyInterest.create({
        data: {
          userId: buyer.id,
          companyId: company.id,
          type: "REQUEST_INFO",
          status: row.status,
          createdAt: when,
          statusUpdatedAt: when,
          internalNote: row.status === "IN_REVIEW" ? "Pendiente de confirmar EBITDA con el vendedor antes de conceder el teaser." : null,
        },
      });
    }

    console.log("Listo. Usuarios de prueba:");
    for (const row of USERS) {
      console.log(`  ${row.role}: ${row.email} / ${row.password}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
