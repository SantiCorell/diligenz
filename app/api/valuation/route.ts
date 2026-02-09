import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { generateDealTitle } from "@/lib/dealCode";

function computeValuation(body: {
  sector: string;
  revenue: number;
  ebitda?: number | null;
  employees?: number | null;
}) {
  const { sector, revenue, ebitda, employees } = body;
  let multipleMin = 0.6;
  let multipleMax = 1.2;

  const s = String(sector).toLowerCase();
  if (s.includes("tech") || s.includes("tecnologia") || s.includes("software")) {
    multipleMin = 1.5;
    multipleMax = 3.0;
  }
  if (s.includes("hostel") || s.includes("resta")) {
    multipleMin = 0.5;
    multipleMax = 1.0;
  }

  const base = ebitda && ebitda > 0 ? ebitda * 4 : revenue * 0.2;
  const teamFactor = typeof employees === "number" && employees > 20 ? 1.1 : 1.0;
  const minValue = Math.round(base * multipleMin * teamFactor);
  const maxValue = Math.round(base * multipleMax * teamFactor);
  return { minValue, maxValue };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sector, location, revenue, ebitda, employees, companyName, description } = body;

    if (!sector || !location || revenue == null || revenue <= 0) {
      return NextResponse.json(
        { error: "Indica al menos sector, ubicación y facturación anual." },
        { status: 400 }
      );
    }

    const name = (companyName && String(companyName).trim()) || "Empresa sin nombre";
    const descriptionStr = (description && String(description).trim()) || null;

    const numRevenue = Number(revenue);
    const numEbitda = ebitda != null && ebitda !== "" ? Number(ebitda) : null;
    const numEmployees = employees != null && employees !== "" ? Number(employees) : null;

    const { minValue, maxValue } = computeValuation({
      sector,
      revenue: numRevenue,
      ebitda: numEbitda,
      employees: numEmployees,
    });

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (sessionCookie?.value) {
      const userId = sessionCookie.value;
      const company = await prisma.company.create({
        data: {
          name,
          sector,
          location: String(location),
          revenue: String(numRevenue),
          ebitda: numEbitda != null ? String(numEbitda) : null,
          employees: numEmployees ?? null,
          description: descriptionStr,
          ownerId: userId,
        },
      });
      await prisma.valuation.create({
        data: { minValue, maxValue, companyId: company.id },
      });
      const slugBase = `${sector}-${location}-${company.id}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 60);
      await prisma.deal.create({
        data: {
          title: generateDealTitle(),
          slug: slugBase,
          published: false,
          companyId: company.id,
        },
      });
    }

    return NextResponse.json({ minValue, maxValue });
  } catch (error) {
    console.error("Valuation error:", error);
    return NextResponse.json(
      { error: "Error al procesar la valoración" },
      { status: 500 }
    );
  }
}
