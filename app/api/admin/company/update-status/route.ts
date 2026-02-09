import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { CompanyStatus } from "@prisma/client";

export async function POST(req: Request) {
  // =====================
  // 🔐 AUTENTICACIÓN
  // =====================
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    return NextResponse.redirect(
      new URL("/register", req.url)
    );
  }

  // =====================
  // 🔐 AUTORIZACIÓN (ADMIN)
  // =====================
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
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
