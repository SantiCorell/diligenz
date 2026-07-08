import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIP } from "@/lib/security";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateSignedColaboracionDocuments } from "@/lib/mandato/generate-signed-colaboracion-pdfs";
import {
  colaboracionZipFileName,
  zipColaboracionDocuments,
} from "@/lib/mandato/colaboracion-zip";
import { sendMandatoSignedEmails } from "@/lib/emails/mandato-signed";
import { syncDocumentToUserDrive } from "@/lib/google-drive/document-sync";
import {
  ensureUserDriveFolder,
  syncUserDriveFolderName,
} from "@/lib/google-drive/user-drive";

const PROFESSIONAL_ROLES = new Set(["PROFESSIONAL", "ADMIN"]);

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!PROFESSIONAL_ROLES.has(session.user.role)) {
    return NextResponse.json(
      { error: "Solo profesionales pueden firmar el acuerdo de colaboración." },
      { status: 403 }
    );
  }

  const existing = await prisma.collaborationAgreement.findUnique({
    where: { userId: session.userId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Ya has firmado el acuerdo de colaboración." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const {
    professionalLegalName,
    professionalNif,
    professionalAddress,
    contactEmail,
    contactPhone,
    representativeName,
    representativeDni,
    representativeRole,
    signaturePngBase64,
    termsAccepted,
  } = body;

  if (
    !professionalLegalName?.trim() ||
    !professionalNif?.trim() ||
    !professionalAddress?.trim() ||
    !contactEmail?.trim() ||
    !signaturePngBase64 ||
    !termsAccepted
  ) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios o la aceptación de términos." },
      { status: 400 }
    );
  }

  const signedAt = new Date();
  const clientIp = getClientIP(req.headers);
  const userAgent = req.headers.get("user-agent");

  const payload = {
    professionalLegalName: String(professionalLegalName).trim(),
    professionalNif: String(professionalNif).trim(),
    professionalAddress: String(professionalAddress).trim(),
    contactEmail: String(contactEmail).trim(),
    contactPhone: contactPhone ? String(contactPhone).trim() : null,
    representativeName: representativeName != null ? String(representativeName).trim() : "",
    representativeDni: representativeDni != null ? String(representativeDni).trim() : "",
    representativeRole: representativeRole ? String(representativeRole).trim() : null,
    signaturePngBase64: String(signaturePngBase64),
    signedAt,
    clientIp,
    userAgent,
  };

  const docs = await generateSignedColaboracionDocuments(payload);
  const zipBytes = await zipColaboracionDocuments(docs);
  const zipFileName = colaboracionZipFileName(signedAt);

  let driveFolderCreated = false;
  let driveDocumentUploadedAll = false;

  try {
    const folderId = await ensureUserDriveFolder({
      userId: session.userId,
      role: session.user.role,
      personName: payload.representativeName || payload.professionalLegalName,
      companyName: payload.professionalLegalName,
      userEmail: session.user.email,
    });
    driveFolderCreated = Boolean(folderId);

    await syncUserDriveFolderName({
      userId: session.userId,
      role: session.user.role,
      personName: payload.representativeName || payload.professionalLegalName,
      companyName: payload.professionalLegalName,
    });

    const uploadedFlags: boolean[] = [];
    for (const file of [
      {
        name: docs.particularesFileName,
        content: Buffer.from(docs.particularesPdf),
      },
      {
        name: docs.generalesFileName,
        content: Buffer.from(docs.generalesPdf),
      },
    ]) {
      const uploaded = await syncDocumentToUserDrive({
        userId: session.userId,
        kind: "mandato",
        originalFileName: file.name,
        mimeType: "application/pdf",
        content: file.content,
        companyName: payload.professionalLegalName,
      });
      uploadedFlags.push(Boolean(uploaded));
    }

    driveDocumentUploadedAll = uploadedFlags.length > 0 && uploadedFlags.every(Boolean);

    if (!driveFolderCreated) {
      console.warn("[mandato/colaboracion/sign] Drive carpeta no creada (verifica config/env/Drive).");
    }
    if (!driveDocumentUploadedAll) {
      console.warn("[mandato/colaboracion/sign] Drive documentos no subidos (verifica config/env/Drive).");
    }
  } catch (driveError) {
    console.error("[mandato/colaboracion/sign] google drive error:", driveError);
  }

  const driveOk = driveFolderCreated && driveDocumentUploadedAll;

  await prisma.$transaction([
    prisma.collaborationAgreement.create({
      data: {
        userId: session.userId,
        professionalLegalName: payload.professionalLegalName,
        professionalNif: payload.professionalNif,
        professionalAddress: payload.professionalAddress,
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        representativeName: payload.representativeName,
        representativeDni: payload.representativeDni,
        representativeRole: payload.representativeRole,
        signaturePngBase64: payload.signaturePngBase64,
        signedAt,
        clientIp,
        userAgent,
        termsAccepted: true,
      },
    }),
    prisma.user.update({
      where: { id: session.userId },
      data: { ndaSigned: true },
    }),
  ]);

  const clientName = payload.representativeName || payload.professionalLegalName;
  const representativeLine =
    payload.representativeName || payload.representativeDni
      ? `${payload.representativeName || "—"} (${payload.representativeDni || "—"})`
      : "No indicado";
  const attachments = [
    { filename: docs.particularesFileName, content: Buffer.from(docs.particularesPdf) },
    { filename: docs.generalesFileName, content: Buffer.from(docs.generalesPdf) },
    { filename: zipFileName, content: zipBytes },
  ];

  const { userSent: userEmailSent, internalSent: internalEmailSent } =
    await sendMandatoSignedEmails({
      clientEmail: payload.contactEmail || session.user.email,
      clientName,
      documentTitle: "Acuerdo de Colaboración",
      signedAt,
      userSubject: "Copia de tu Acuerdo de Colaboración firmado — Diligenz",
      internalSubject: `Nuevo acuerdo de colaboración firmado — ${payload.professionalLegalName}`,
      internalSummaryHtml: `<strong>Profesional:</strong> ${payload.professionalLegalName} (${payload.professionalNif})<br>
<strong>Representante:</strong> ${representativeLine}<br>
<strong>Email contacto:</strong> ${payload.contactEmail}<br>
<strong>Teléfono:</strong> ${payload.contactPhone ?? "—"}`,
      internalSummaryText: `Profesional: ${payload.professionalLegalName} (${payload.professionalNif})
Representante: ${representativeLine}
Email contacto: ${payload.contactEmail}
Teléfono: ${payload.contactPhone ?? "—"}`,
      attachments,
    });

  if (!userEmailSent) {
    console.warn("[mandato/colaboracion/sign] PDF firmado OK; correo al profesional no enviado (revisa SMTP).");
  }
  if (!internalEmailSent) {
    console.warn(
      "[mandato/colaboracion/sign] PDF firmado OK; copia interna no enviada (revisa SMTP/MANDATO_NOTIFY_EMAIL)"
    );
  }

  return new NextResponse(new Uint8Array(zipBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
      "X-Particulares-Filename": docs.particularesFileName,
      "X-Generales-Filename": docs.generalesFileName,
      "X-Drive-Synced": driveOk ? "1" : "0",
      "X-Email-User-Sent": userEmailSent ? "1" : "0",
      "X-Email-Internal-Sent": internalEmailSent ? "1" : "0",
    },
  });
}
