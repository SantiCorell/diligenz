// app/api/admin/company/force-publish/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionWithUser } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSessionWithUser();
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

  await prisma.company.update({
    where: { id: companyId },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.redirect(
    new URL(`/admin/companies/${companyId}?success=force_published`, req.url)
  );
}
