import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { generateSignedMandatePdf } from "@/lib/mandato/generate-signed-pdf";
import { dniAbsolutePath } from "@/lib/user-documents/dni";
import { syncDocumentToUserDrive } from "./document-sync";
import { ensureUserDriveFolder, syncUserDriveFolderName } from "./user-drive";
import { isGoogleDriveConfigured } from "./client";

export async function syncAllUserDocumentsToDrive(userId: string): Promise<{
  ok: boolean;
  folderUrl: string | null;
  synced: string[];
  errors: string[];
}> {
  const synced: string[] = [];
  const errors: string[] = [];

  if (!isGoogleDriveConfigured()) {
    return {
      ok: false,
      folderUrl: null,
      synced,
      errors: ["Google Drive no configurado (faltan GOOGLE_DRIVE_* en .env.local)"],
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      documentsDriveFolderUrl: true,
      dniDocuments: true,
      salesMandate: true,
      companies: { select: { name: true }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    return { ok: false, folderUrl: null, synced, errors: ["Usuario no encontrado"] };
  }

  const personName = user.name?.trim() || user.email.split("@")[0];
  const companyName =
    user.salesMandate?.companyLegalName ?? user.companies[0]?.name ?? null;

  const folderId = await ensureUserDriveFolder({
    userId: user.id,
    role: user.role,
    personName,
    companyName,
    userEmail: user.email,
  });

  if (!folderId) {
    errors.push("No se pudo crear la carpeta en Drive");
    return { ok: false, folderUrl: user.documentsDriveFolderUrl, synced, errors };
  }

  await syncUserDriveFolderName({
    userId: user.id,
    role: user.role,
    personName: user.salesMandate?.representativeName ?? personName,
    companyName,
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { documentsDriveFolderUrl: true },
  });

  for (const doc of user.dniDocuments) {
    try {
      const buffer = await readFile(dniAbsolutePath(doc.storagePath));
      const kind = doc.side === "FRONT" ? "dni-front" : "dni-back";
      const ok = await syncDocumentToUserDrive({
        userId: user.id,
        kind,
        originalFileName: doc.name,
        mimeType: doc.mimeType ?? "application/octet-stream",
        content: buffer,
      });
      if (ok) {
        await prisma.userDniDocument.update({
          where: { id: doc.id },
          data: { driveSyncedAt: new Date() },
        });
        synced.push(kind);
      } else {
        errors.push(`DNI ${doc.side}: no se subió`);
      }
    } catch (e) {
      errors.push(`DNI ${doc.side}: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  if (user.salesMandate) {
    try {
      const m = user.salesMandate;
      const pdfBytes = await generateSignedMandatePdf({
        representativeName: m.representativeName,
        representativeDni: m.representativeDni,
        companyLegalName: m.companyLegalName,
        companyCif: m.companyCif,
        companyAddress: m.companyAddress,
        contactEmail: m.contactEmail,
        contactPhone: m.contactPhone,
        companyTradeName: m.companyTradeName,
        companySector: m.companySector,
        companyCnae: m.companyCnae,
        companyFoundedYear: m.companyFoundedYear,
        employeeCount: m.employeeCount,
        lastRevenueEur: m.lastRevenueEur,
        lastEbitdaEur: m.lastEbitdaEur,
        expectedSalePriceEur: m.expectedSalePriceEur,
        saleReason: m.saleReason,
        signaturePngBase64: m.signaturePngBase64,
        signedAt: m.signedAt,
        clientIp: m.clientIp,
        userAgent: m.userAgent,
      });
      const fileName = `mandato-venta-diligenz-${m.signedAt.toISOString().slice(0, 10)}.pdf`;
      const ok = await syncDocumentToUserDrive({
        userId: user.id,
        kind: "mandato",
        originalFileName: fileName,
        mimeType: "application/pdf",
        content: Buffer.from(pdfBytes),
        companyName: m.companyLegalName,
      });
      if (ok) synced.push("mandato");
      else errors.push("Mandato: no se subió");
    } catch (e) {
      errors.push(`Mandato: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return {
    ok: errors.length === 0,
    folderUrl: updatedUser?.documentsDriveFolderUrl ?? null,
    synced,
    errors,
  };
}
