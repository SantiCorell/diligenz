import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Publicar el deal en el marketplace (visible para usuarios).
 * Solo esta acción hace que la empresa aparezca en el listado público.
 * "Actualizar estado" a PUBLISHED no modifica Deal.published.
 */
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

  const deal = await prisma.deal.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  if (!deal) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=no_deal`, req.url)
    );
  }

  await prisma.deal.update({
    where: { id: deal.id },
    data: { published: true },
  });

  return NextResponse.redirect(
    new URL(`/admin/companies/${companyId}?success=published_marketplace`, req.url)
  );
}
