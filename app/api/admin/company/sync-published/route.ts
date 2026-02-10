import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

/**
 * Sincroniza visibilidad en la web con el estado de la empresa:
 * Todas las empresas con status PUBLISHED pasan a tener su deal publicado (visible en la web).
 * Útil para alinear el panel con la web cuando ya tenías empresas en PUBLISHED.
 */
export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const publishedCompanies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
  });
  const companyIds = publishedCompanies.map((c) => c.id);

  const result = await prisma.deal.updateMany({
    where: { companyId: { in: companyIds } },
    data: { published: true },
  });

  const { searchParams } = new URL(req.url);
  if (searchParams.get("redirect") === "1") {
    return NextResponse.redirect(
      new URL(`/admin?synced=${result.count}`, req.url)
    );
  }

  return NextResponse.json({
    ok: true,
    message: `${result.count} empresa(s) ahora visible(s) en la web.`,
    updated: result.count,
  });
}
