import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIP } from "@/lib/security";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateSignedColaboracionDocuments } from "@/lib/mandato/generate-signed-colaboracion-pdfs";
import {
  colaboracionZipFileName,
  zipColaboracionDocuments,
} from "@/lib/mandato/colaboracion-zip";
import { sendEmail } from "@/lib/email";
import { syncDocumentToUserDrive } from "@/lib/google-drive/document-sync";
import { syncUserDriveFolderName } from "@/lib/google-drive/user-drive";

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
    !representativeName?.trim() ||
    !representativeDni?.trim() ||
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
    representativeName: String(representativeName).trim(),
    representativeDni: String(representativeDni).trim(),
    representativeRole: representativeRole ? String(representativeRole).trim() : null,
    signaturePngBase64: String(signaturePngBase64),
    signedAt,
    clientIp,
    userAgent,
  };

  const docs = await generateSignedColaboracionDocuments(payload);
  const zipBytes = await zipColaboracionDocuments(docs);
  const zipFileName = colaboracionZipFileName(signedAt);

  try {
    await syncUserDriveFolderName({
      userId: session.userId,
      role: session.user.role,
      personName: payload.representativeName,
      companyName: payload.professionalLegalName,
    });
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
      await syncDocumentToUserDrive({
        userId: session.userId,
        kind: "mandato",
        originalFileName: file.name,
        mimeType: "application/pdf",
        content: file.content,
        companyName: payload.professionalLegalName,
      });
    }
  } catch (driveError) {
    console.error("[mandato/colaboracion/sign] google drive error:", driveError);
  }

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

  const emailTo = payload.contactEmail || session.user.email;
  const diligenzNotifyEmail =
    process.env.MANDATO_NOTIFY_EMAIL?.trim() || "info@diligenz.es";
  const signedAtLabel = signedAt.toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const attachments = [
    { filename: docs.particularesFileName, content: Buffer.from(docs.particularesPdf) },
    { filename: docs.generalesFileName, content: Buffer.from(docs.generalesPdf) },
    { filename: zipFileName, content: zipBytes },
  ];

  try {
    await sendEmail({
      to: emailTo,
      subject: "Copia de tu Acuerdo de Colaboración firmado — Diligenz",
      text: `Hola ${payload.representativeName},\n\nAdjuntamos copia del Acuerdo de Colaboración (Condiciones Particulares y Condiciones Generales) que has firmado electrónicamente en Diligenz el ${signedAtLabel}.\n\nConserva estos documentos para tu registro.\n\nDILIGENZ`,
      attachments,
    });
  } catch (e) {
    console.error("[mandato/colaboracion/sign] email profesional error:", e);
  }

  if (emailTo.toLowerCase() !== diligenzNotifyEmail.toLowerCase()) {
    try {
      await sendEmail({
        to: diligenzNotifyEmail,
        subject: `Nuevo acuerdo de colaboración firmado — ${payload.professionalLegalName}`,
        text: `Se ha firmado un nuevo Acuerdo de Colaboración en Diligenz.\n\nProfesional: ${payload.professionalLegalName} (${payload.professionalNif})\nRepresentante: ${payload.representativeName} (${payload.representativeDni})\nEmail contacto: ${payload.contactEmail}\nTeléfono: ${payload.contactPhone ?? "—"}\nFecha de firma: ${signedAtLabel}\n\nAdjuntos: Condiciones Particulares, Condiciones Generales y ZIP.`,
        attachments,
      });
    } catch (e) {
      console.error("[mandato/colaboracion/sign] email info@diligenz error:", e);
    }
  }

  return new NextResponse(zipBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFileName}"`,
      "X-Particulares-Filename": docs.particularesFileName,
      "X-Generales-Filename": docs.generalesFileName,
    },
  });
}
