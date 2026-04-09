import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";
import { generateDealTitle } from "@/lib/dealCode";
import { computeValuationRange } from "@/lib/compute-valuation-range";
import { sanitizeLongText, sanitizeString } from "@/lib/security";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(String(email).trim());
}

function isValidPhone(phone: string): boolean {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 9;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sector,
      location,
      revenue,
      ebitda,
      exerciseResult,
      employees,
      companyName,
      description,
      email,
      phone,
      companyType,
      yearsOperating,
      revenueGrowthPercent,
      stage,
      takeRatePercent,
      arr,
      breakevenExpectedYear,
      hasReceivedFunding,
      website,
      sectorSubcategory,
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
    const descriptionStr =
      description != null && String(description).trim()
        ? sanitizeLongText(String(description))
        : null;

    const numRevenue = Number(revenue);
    const numEbitda = ebitda != null && ebitda !== "" ? Number(ebitda) : null;
    const numExerciseResultRaw =
      exerciseResult != null && exerciseResult !== "" ? Number(exerciseResult) : null;
    const numExerciseResult =
      numExerciseResultRaw != null && Number.isFinite(numExerciseResultRaw)
        ? numExerciseResultRaw
        : null;
    const numEmployees = employees != null && employees !== "" ? Number(employees) : null;
    const numYearsOperating = yearsOperating != null && yearsOperating !== "" ? Number(yearsOperating) : null;
    const numRevenueGrowth = revenueGrowthPercent != null && revenueGrowthPercent !== "" ? Number(revenueGrowthPercent) : null;
    const numTakeRate = takeRatePercent != null && takeRatePercent !== "" ? Number(takeRatePercent) : null;
    const numArr = arr != null && arr !== "" ? Number(arr) : null;
    const numBreakevenYear = breakevenExpectedYear != null && breakevenExpectedYear !== "" ? Number(breakevenExpectedYear) : null;
    const companyTypeStr = companyType && String(companyType).trim() ? String(companyType).trim().toUpperCase() : null;
    const stageStr = stage && String(stage).trim() ? String(stage).trim() : null;
    const hasFunding = hasReceivedFunding === true || hasReceivedFunding === "true";
    const websiteStr = website != null && String(website).trim() !== "" ? String(website).trim() : null;
    const sectorSubcategoryStr =
      sectorSubcategory != null && String(sectorSubcategory).trim() !== ""
        ? sanitizeString(sectorSubcategory).slice(0, 280) || null
        : null;

    const { minValue, maxValue } = computeValuationRange({
      sector,
      revenue: numRevenue,
      ebitda: numEbitda,
      employees: numEmployees,
      companyType: companyTypeStr,
      yearsOperating: numYearsOperating,
      revenueGrowthPercent: numRevenueGrowth,
      arr: numArr,
    });

    await prisma.valuationLead.create({
      data: {
        email: emailStr,
        phone: phoneStr,
        companyName: name !== "Empresa sin nombre" ? name : null,
        sector,
        sectorSubcategory: sectorSubcategoryStr,
        location: String(location),
        revenue: numRevenue,
        ebitda: numEbitda ?? null,
        exerciseResult: numExerciseResult != null ? Math.round(numExerciseResult) : null,
        employees: numEmployees ?? null,
        description: descriptionStr,
        minValue,
        maxValue,
        companyType: companyTypeStr,
        yearsOperating: numYearsOperating,
        revenueGrowthPercent: numRevenueGrowth,
        stage: stageStr,
        takeRatePercent: numTakeRate,
        arr: numArr,
        breakevenExpectedYear: numBreakevenYear,
        hasReceivedFunding: hasReceivedFunding != null ? hasFunding : null,
        website: websiteStr,
        category: "pendiente",
      },
    });

    const userId = await getUserIdFromRequest(req);

    if (userId) {
      const company = await prisma.company.create({
        data: {
          name,
          sector,
          sectorSubcategory: sectorSubcategoryStr,
          location: String(location),
          revenue: String(numRevenue),
          ebitda: numEbitda != null ? String(numEbitda) : null,
          exerciseResult: numExerciseResult != null ? String(Math.round(numExerciseResult)) : null,
          employees: numEmployees ?? null,
          description: descriptionStr,
          ownerId: userId,
          companyType: companyTypeStr,
          yearsOperating: numYearsOperating,
          revenueGrowthPercent: numRevenueGrowth,
          stage: stageStr,
          takeRatePercent: numTakeRate,
          arr: numArr,
          breakevenExpectedYear: numBreakevenYear,
          hasReceivedFunding: hasReceivedFunding != null ? hasFunding : null,
          website: websiteStr,
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
