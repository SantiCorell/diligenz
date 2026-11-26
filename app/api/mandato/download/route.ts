import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateSignedVentaDocuments } from "@/lib/mandato/generate-signed-pdf";
import { ventaZipFileName, zipVentaDocuments } from "@/lib/mandato/venta-zip";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const mandate = await prisma.salesMandate.findUnique({
    where: { userId: session.userId },
  });
  if (!mandate) {
    return NextResponse.json({ error: "No hay mandato firmado." }, { status: 404 });
  }

  const docs = await generateSignedVentaDocuments({
    representativeName: mandate.representativeName,
    representativeDni: mandate.representativeDni,
    companyLegalName: mandate.companyLegalName,
    companyCif: mandate.companyCif,
    companyAddress: mandate.companyAddress,
    contactEmail: mandate.contactEmail,
    contactPhone: mandate.contactPhone,
    companyTradeName: mandate.companyTradeName,
    companySector: mandate.companySector,
    companyCnae: mandate.companyCnae,
    companyFoundedYear: mandate.companyFoundedYear,
    employeeCount: mandate.employeeCount,
    lastRevenueEur: mandate.lastRevenueEur,
    lastEbitdaEur: mandate.lastEbitdaEur,
    expectedSalePriceEur: mandate.expectedSalePriceEur,
    saleReason: mandate.saleReason,
    signaturePngBase64: mandate.signaturePngBase64,
    signedAt: mandate.signedAt,
    clientIp: mandate.clientIp,
    userAgent: mandate.userAgent,
  }, mandate.variant);

  const zipBytes = await zipVentaDocuments(docs);
  const zipFileName = ventaZipFileName(mandate.signedAt, mandate.variant);

  return new NextResponse(new Uint8Array(zipBytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
    },
  });
}
