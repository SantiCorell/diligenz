import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateSignedCompraDocuments } from "@/lib/mandato/generate-signed-compra-pdf";
import { compraZipFileName, zipCompraDocuments } from "@/lib/mandato/compra-zip";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const mandate = await prisma.purchaseMandate.findUnique({
    where: { userId: session.userId },
  });
  if (!mandate) {
    return NextResponse.json({ error: "No hay mandato firmado." }, { status: 404 });
  }

  const docs = await generateSignedCompraDocuments({
    buyerLegalName: mandate.buyerLegalName,
    buyerNifCif: mandate.buyerNifCif,
    buyerAddress: mandate.buyerAddress,
    contactEmail: mandate.contactEmail,
    contactPhone: mandate.contactPhone,
    representativeName: mandate.representativeName,
    representativeDni: mandate.representativeDni,
    representativeRole: mandate.representativeRole,
    signaturePngBase64: mandate.signaturePngBase64,
    signedAt: mandate.signedAt,
    clientIp: mandate.clientIp,
    userAgent: mandate.userAgent,
  });

  const zipBytes = await zipCompraDocuments(docs);
  const zipFileName = compraZipFileName(mandate.signedAt);

  return new NextResponse(zipBytes, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
    },
  });
}
