import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateSignedColaboracionDocuments } from "@/lib/mandato/generate-signed-colaboracion-pdfs";
import {
  colaboracionZipFileName,
  zipColaboracionDocuments,
} from "@/lib/mandato/colaboracion-zip";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const agreement = await prisma.collaborationAgreement.findUnique({
    where: { userId: session.userId },
  });
  if (!agreement) {
    return NextResponse.json({ error: "No hay acuerdo firmado." }, { status: 404 });
  }

  const docs = await generateSignedColaboracionDocuments({
    professionalLegalName: agreement.professionalLegalName,
    professionalNif: agreement.professionalNif,
    professionalAddress: agreement.professionalAddress,
    contactEmail: agreement.contactEmail,
    contactPhone: agreement.contactPhone,
    representativeName: agreement.representativeName,
    representativeDni: agreement.representativeDni,
    representativeRole: agreement.representativeRole,
    signaturePngBase64: agreement.signaturePngBase64,
    signedAt: agreement.signedAt,
    clientIp: agreement.clientIp,
    userAgent: agreement.userAgent,
  });

  const zipBytes = await zipColaboracionDocuments(docs);
  const zipFileName = colaboracionZipFileName(agreement.signedAt);

  return new NextResponse(zipBytes, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
    },
  });
}
