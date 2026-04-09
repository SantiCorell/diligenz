import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CompanyStatus } from "@prisma/client";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // =====================
  // 📦 LEER FORMDATA
  // =====================
  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  const statusRaw = formData.get("status")?.toString();

  if (!companyId || !statusRaw) {
    return NextResponse.redirect(
      new URL(
        `/admin/companies?error=missing_data`,
        req.url
      )
    );
  }

  // =====================
  // ✅ VALIDAR ENUM
  // =====================
  if (
    !Object.values(CompanyStatus).includes(
      statusRaw as CompanyStatus
    )
  ) {
    return NextResponse.redirect(
      new URL(
        `/admin/companies/${companyId}?error=invalid_status`,
        req.url
      )
    );
  }

  const status = statusRaw as CompanyStatus;

  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=company_removed`, req.url)
    );
  }

  // =====================
  // 🔁 ACTUALIZAR ESTADO
  // =====================
  await prisma.company.update({
    where: { id: companyId },
    data: { status },
  });

  // Sincronizar visibilidad en la web: si estado es PUBLISHED, el deal se publica; si no, se quita
  const publishedOnWeb = status === "PUBLISHED";
  await prisma.deal.updateMany({
    where: { companyId },
    data: { published: publishedOnWeb },
  });

  // =====================
  // ✅ ÉXITO
  // =====================
  return NextResponse.redirect(
    new URL(
      `/admin/companies/${companyId}?success=status_updated`,
      req.url
    )
  );
}
