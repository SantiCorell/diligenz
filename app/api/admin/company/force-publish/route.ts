// app/api/admin/company/force-publish/route.ts
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return NextResponse.redirect(new URL("/register", req.url));

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
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
