import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { generateSignedVentaDocuments } from "@/lib/mandato/generate-signed-pdf";
import { generateSignedCompraDocuments } from "@/lib/mandato/generate-signed-compra-pdf";
import { generateSignedColaboracionDocuments } from "@/lib/mandato/generate-signed-colaboracion-pdfs";
import { dniAbsolutePath, isCloudOnlyDniPath } from "@/lib/user-documents/dni";
import { syncDocumentToUserDrive } from "./document-sync";
import { ensureUserDriveFolder } from "./user-drive";
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
      documentsDriveFolderUrl: true,
      dniDocuments: true,
      salesMandate: true,
      purchaseMandate: true,
      collaborationAgreement: true,
    },
  });

  if (!user) {
    return { ok: false, folderUrl: null, synced, errors: ["Usuario no encontrado"] };
  }

  const hasContent =
    user.dniDocuments.length > 0 ||
    Boolean(user.salesMandate) ||
    Boolean(user.purchaseMandate) ||
    Boolean(user.collaborationAgreement);

  if (!hasContent) {
    return {
      ok: true,
      folderUrl: user.documentsDriveFolderUrl,
      synced,
      errors: [],
    };
  }

  const folderId = await ensureUserDriveFolder({ userId: user.id });

  if (!folderId) {
    errors.push("No hay carpeta de Drive enlazada. Añádela en la ficha del usuario.");
    return { ok: false, folderUrl: user.documentsDriveFolderUrl, synced, errors };
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { documentsDriveFolderUrl: true },
  });

  for (const doc of user.dniDocuments) {
    if (doc.driveSyncedAt) continue;
    try {
      if (isCloudOnlyDniPath(doc.storagePath)) {
        errors.push(`DNI ${doc.side}: solo en Drive (sin copia local)`);
        continue;
      }
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
      const docs = await generateSignedVentaDocuments({
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
      }, m.variant);
      for (const file of [
        { name: docs.particularesFileName, content: Buffer.from(docs.particularesPdf) },
        { name: docs.generalesFileName, content: Buffer.from(docs.generalesPdf) },
      ]) {
        const ok = await syncDocumentToUserDrive({
          userId: user.id,
          kind: "mandato",
          originalFileName: file.name,
          mimeType: "application/pdf",
          content: file.content,
          companyName: m.companyLegalName,
        });
        if (ok) synced.push(file.name);
        else errors.push(`${file.name}: no se subió`);
      }
    } catch (e) {
      errors.push(`Mandato venta: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  if (user.purchaseMandate) {
    try {
      const m = user.purchaseMandate;
      const docs = await generateSignedCompraDocuments({
        buyerLegalName: m.buyerLegalName,
        buyerNifCif: m.buyerNifCif,
        buyerAddress: m.buyerAddress,
        contactEmail: m.contactEmail,
        contactPhone: m.contactPhone,
        representativeName: m.representativeName,
        representativeDni: m.representativeDni,
        representativeRole: m.representativeRole,
        signaturePngBase64: m.signaturePngBase64,
        signedAt: m.signedAt,
        clientIp: m.clientIp,
        userAgent: m.userAgent,
      });
      for (const file of [
        { name: docs.particularesFileName, content: Buffer.from(docs.particularesPdf) },
        { name: docs.generalesFileName, content: Buffer.from(docs.generalesPdf) },
      ]) {
        const ok = await syncDocumentToUserDrive({
          userId: user.id,
          kind: "mandato",
          originalFileName: file.name,
          mimeType: "application/pdf",
          content: file.content,
          companyName: m.buyerLegalName,
        });
        if (ok) synced.push(file.name);
        else errors.push(`${file.name}: no se subió`);
      }
    } catch (e) {
      errors.push(`Mandato compra: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  if (user.collaborationAgreement) {
    try {
      const m = user.collaborationAgreement;
      const docs = await generateSignedColaboracionDocuments({
        professionalLegalName: m.professionalLegalName,
        professionalNif: m.professionalNif,
        professionalAddress: m.professionalAddress,
        contactEmail: m.contactEmail,
        contactPhone: m.contactPhone,
        representativeName: m.representativeName,
        representativeDni: m.representativeDni,
        representativeRole: m.representativeRole,
        signaturePngBase64: m.signaturePngBase64,
        signedAt: m.signedAt,
        clientIp: m.clientIp,
        userAgent: m.userAgent,
      });
      for (const file of [
        { name: docs.particularesFileName, content: Buffer.from(docs.particularesPdf) },
        { name: docs.generalesFileName, content: Buffer.from(docs.generalesPdf) },
      ]) {
        const ok = await syncDocumentToUserDrive({
          userId: user.id,
          kind: "mandato",
          originalFileName: file.name,
          mimeType: "application/pdf",
          content: file.content,
          companyName: m.professionalLegalName,
        });
        if (ok) synced.push(file.name);
        else errors.push(`${file.name}: no se subió`);
      }
    } catch (e) {
      errors.push(`Acuerdo colaboración: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return {
    ok: errors.length === 0,
    folderUrl: updatedUser?.documentsDriveFolderUrl ?? null,
    synced,
    errors,
  };
}
