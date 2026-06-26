import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";
import { isFeaturedActive } from "@/lib/company-ranking";

/**
 * Destaca o quita el destacado de una empresa en listados y home.
 * El destacado caduca solo a los 14 días.
 */
export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  if (!companyId) {
    return NextResponse.redirect(new URL("/admin/companies?error=missing_company", req.url));
  }

  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=company_removed`, req.url)
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { deals: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!company) {
    return NextResponse.redirect(new URL("/admin/companies?error=not_found", req.url));
  }

  const deal = company.deals[0];
  if (!deal?.published) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=feature_not_published`, req.url)
    );
  }

  const currentlyFeatured = isFeaturedActive(company.featuredAt);
  await prisma.company.update({
    where: { id: companyId },
    data: { featuredAt: currentlyFeatured ? null : new Date() },
  });

  return NextResponse.redirect(
    new URL(
      `/admin/companies/${companyId}?success=${currentlyFeatured ? "unfeatured" : "featured"}`,
      req.url
    )
  );
}
