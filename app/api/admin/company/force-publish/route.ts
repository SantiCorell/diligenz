// app/api/admin/company/force-publish/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";

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

  await prisma.company.update({
    where: { id: companyId },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.redirect(
    new URL(`/admin/companies/${companyId}?success=force_published`, req.url)
  );
}
