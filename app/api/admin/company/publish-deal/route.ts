import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";

/**
 * Publicar el deal en el marketplace y marcar la empresa como publicada.
 */
export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  if (!companyId) {
    return NextResponse.redirect(
      new URL("/admin/companies?error=missing_company", req.url)
    );
  }

  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=company_removed`, req.url)
    );
  }

  const deal = await prisma.deal.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  if (!deal) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=no_deal`, req.url)
    );
  }

  await prisma.$transaction([
    prisma.deal.update({
      where: { id: deal.id },
      data: { published: true },
    }),
    prisma.company.update({
      where: { id: companyId },
      data: { status: "PUBLISHED" },
    }),
  ]);

  return NextResponse.redirect(
    new URL(`/admin/companies/${companyId}?success=status_updated`, req.url)
  );
}
