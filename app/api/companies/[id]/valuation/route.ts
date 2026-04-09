import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { canOwnerEditCompanyListing } from "@/lib/company-owner-edit";
import { parseValuationFormData, upsertCompanyValuation } from "@/lib/update-company-valuation";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId } = await params;
  if (!companyId) {
    return NextResponse.json({ error: "Empresa no indicada" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true, removedAt: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }
  if (company.removedAt) {
    return NextResponse.json(
      { error: "Esta empresa fue eliminada y no admite cambios" },
      { status: 400 }
    );
  }

  const isOwner = company.ownerId === session.userId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  if (!(await canOwnerEditCompanyListing(companyId, session.userId))) {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(
      new URL(`/dashboard/seller/companies/${companyId}?error=published_readonly`, origin)
    );
  }

  const formData = await req.formData();
  const parsed = parseValuationFormData(formData);
  if ("error" in parsed) {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(new URL(`/dashboard/seller/companies/${companyId}?error=valuation`, origin));
  }

  await upsertCompanyValuation(companyId, parsed);

  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL(`/dashboard/seller/companies/${companyId}?success=valuation`, origin));
}
