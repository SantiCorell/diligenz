import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";
import { generateDealTitle } from "@/lib/dealCode";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(String(email).trim());
}

function isValidPhone(phone: string): boolean {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 9;
}

/**
 * Valoración orientativa por múltiplos de sector.
 * - Con EBITDA: múltiplo sobre EBITDA (más fiable).
 * - Sin EBITDA: múltiplo sobre facturación (más conservador).
 * Sectores con rangos típicos de múltiplos (EBITDA o revenue según caso).
 */
function computeValuation(body: {
  sector: string;
  revenue: number;
  ebitda?: number | null;
  employees?: number | null;
}) {
  const { sector, revenue, ebitda, employees } = body;
  const s = String(sector).toLowerCase();

  // Múltiplos típicos por sector (sobre EBITDA cuando hay; si no, sobre revenue)
  type SectorMultipliers = { ebitdaMin: number; ebitdaMax: number; revenueMin: number; revenueMax: number };
  const sectors: Record<string, SectorMultipliers> = {
    tecnologia: { ebitdaMin: 5, ebitdaMax: 12, revenueMin: 1, revenueMax: 3 },
    tech: { ebitdaMin: 5, ebitdaMax: 12, revenueMin: 1, revenueMax: 3 },
    software: { ebitdaMin: 5, ebitdaMax: 12, revenueMin: 1, revenueMax: 3 },
    salud: { ebitdaMin: 4, ebitdaMax: 8, revenueMin: 0.8, revenueMax: 1.8 },
    industria: { ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
    consumo: { ebitdaMin: 3.5, ebitdaMax: 6, revenueMin: 0.4, revenueMax: 1 },
    retail: { ebitdaMin: 3.5, ebitdaMax: 6, revenueMin: 0.4, revenueMax: 1 },
    hosteleria: { ebitdaMin: 2.5, ebitdaMax: 5, revenueMin: 0.3, revenueMax: 0.8 },
    restauracion: { ebitdaMin: 2.5, ebitdaMax: 5, revenueMin: 0.3, revenueMax: 0.8 },
    servicios: { ebitdaMin: 3.5, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
    energia: { ebitdaMin: 5, ebitdaMax: 10, revenueMin: 0.8, revenueMax: 1.8 },
    logistica: { ebitdaMin: 4, ebitdaMax: 7, revenueMin: 0.5, revenueMax: 1.2 },
  };

  let mult = sectors["servicios"]!;
  for (const [key, m] of Object.entries(sectors)) {
    if (s.includes(key)) {
      mult = m;
      break;
    }
  }

  const useEbitda = ebitda != null && ebitda > 0;
  const base = useEbitda ? ebitda : revenue;
  const [multipleMin, multipleMax] = useEbitda
    ? [mult.ebitdaMin, mult.ebitdaMax]
    : [mult.revenueMin, mult.revenueMax];

  const teamFactor =
    typeof employees === "number" && employees > 15
      ? 1.05
      : typeof employees === "number" && employees > 5
        ? 1.02
        : 1.0;

  const minValue = Math.round(base * multipleMin * teamFactor);
  const maxValue = Math.round(base * multipleMax * teamFactor);
  return {
    minValue: Math.max(0, minValue),
    maxValue: Math.max(minValue, maxValue),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sector,
      location,
      revenue,
      ebitda,
      employees,
      companyName,
      description,
      email,
      phone,
    } = body;

    const emailStr = email != null ? String(email).trim() : "";
    const phoneStr = phone != null ? String(phone).trim() : "";

    if (!emailStr) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio para enviar la valoración." },
        { status: 400 }
      );
    }
    if (!isValidEmail(emailStr)) {
      return NextResponse.json(
        { error: "Indica un correo electrónico válido." },
        { status: 400 }
      );
    }
    if (!phoneStr) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio para enviar la valoración." },
        { status: 400 }
      );
    }
    if (!isValidPhone(phoneStr)) {
      return NextResponse.json(
        { error: "Indica un teléfono válido (mínimo 9 dígitos)." },
        { status: 400 }
      );
    }

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

    await prisma.valuationLead.create({
      data: {
        email: emailStr,
        phone: phoneStr,
        companyName: name !== "Empresa sin nombre" ? name : null,
        sector,
        location: String(location),
        revenue: numRevenue,
        ebitda: numEbitda ?? null,
        employees: numEmployees ?? null,
        description: descriptionStr,
        minValue,
        maxValue,
      },
    });

    const userId = await getUserIdFromRequest(req);

    if (userId) {
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
