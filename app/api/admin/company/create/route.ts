import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateDealTitle } from "@/lib/dealCode";
import { computeValuationRange } from "@/lib/compute-valuation-range";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const origin = new URL(req.url).origin;
  const formData = await req.formData();
  const ownerId = formData.get("ownerId")?.toString()?.trim();
  const name = formData.get("name")?.toString()?.trim();
  const sector = formData.get("sector")?.toString()?.trim();
  const location = formData.get("location")?.toString()?.trim();
  const revenueRaw = formData.get("revenue")?.toString()?.trim();
  const ebitdaRaw = formData.get("ebitda")?.toString()?.trim();
  const exerciseResultRaw = formData.get("exerciseResult")?.toString()?.trim();

  if (!ownerId || !name || !sector || !location || !revenueRaw) {
    return NextResponse.redirect(new URL("/admin/companies?error=create_missing", origin));
  }

  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner || owner.blocked) {
    return NextResponse.redirect(new URL("/admin/companies?error=create_owner", origin));
  }

  const numRevenue = Number(revenueRaw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(numRevenue) || numRevenue <= 0) {
    return NextResponse.redirect(new URL("/admin/companies?error=create_revenue", origin));
  }

  const numEbitda =
    ebitdaRaw && ebitdaRaw !== ""
      ? (() => {
          const n = Number(ebitdaRaw.replace(/\s/g, "").replace(",", "."));
          return Number.isFinite(n) ? n : null;
        })()
      : null;

  const { minValue, maxValue } = computeValuationRange({
    sector,
    revenue: numRevenue,
    ebitda: numEbitda,
    companyType: "EMPRESA",
  });

  const company = await prisma.company.create({
    data: {
      name,
      sector,
      location,
      revenue: revenueRaw,
      ebitda: numEbitda != null ? String(numEbitda) : null,
      exerciseResult: exerciseResultRaw && exerciseResultRaw !== "" ? exerciseResultRaw : null,
      ownerId,
      status: "DRAFT",
      companyType: "EMPRESA",
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

  return NextResponse.redirect(new URL(`/admin/companies/${company.id}?success=created`, origin));
}
