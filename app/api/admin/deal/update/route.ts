import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  const dealId = formData.get("dealId")?.toString();
  const title = formData.get("title")?.toString()?.trim();
  const slug = formData
    .get("slug")
    ?.toString()
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!companyId || !dealId || !title || !slug || slug.length < 2) {
    const url = new URL(req.url);
    return NextResponse.redirect(new URL(`/admin/companies/${companyId}?error=deal`, url.origin));
  }

  const origin = new URL(req.url).origin;
  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(new URL(`/admin/companies/${companyId}?error=company_removed`, origin));
  }

  const other = await prisma.deal.findFirst({
    where: { slug, NOT: { id: dealId } },
  });
  if (other) {
    return NextResponse.redirect(new URL(`/admin/companies/${companyId}?error=deal_slug`, origin));
  }

  await prisma.deal.update({
    where: { id: dealId },
    data: { title, slug },
  });

  return NextResponse.redirect(new URL(`/admin/companies/${companyId}?success=deal`, origin));
}
