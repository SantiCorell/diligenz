import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  if (!companyId) {
    return NextResponse.redirect(new URL("/admin/companies?error=docs", req.url));
  }

  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=company_removed`, req.url)
    );
  }

  const types: DocumentType[] = ["SALES_MANDATE", "NDA", "AUTHORIZATION"];
  for (const type of types) {
    const signed = formData.get(`signed_${type}`) === "on";
    const existing = await prisma.document.findFirst({
      where: { companyId, type },
    });
    if (existing) {
      await prisma.document.update({
        where: { id: existing.id },
        data: {
          signed,
          signedAt: signed ? new Date() : null,
        },
      });
    } else {
      await prisma.document.create({
        data: {
          companyId,
          type,
          signed,
          signedAt: signed ? new Date() : null,
        },
      });
    }
  }

  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/admin/companies/${companyId}?success=docs`, url.origin));
}
