import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIP } from "@/lib/security";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { generateSignedMandatePdf } from "@/lib/mandato/generate-signed-pdf";
import { sendEmail } from "@/lib/email";
import { syncDocumentToUserDrive } from "@/lib/google-drive/document-sync";
import { syncUserDriveFolderName } from "@/lib/google-drive/user-drive";

const SELLER_ROLES = new Set(["SELLER", "PROFESSIONAL", "ADMIN"]);

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!SELLER_ROLES.has(session.user.role)) {
    return NextResponse.json(
      { error: "Solo vendedores y profesionales pueden firmar el mandato de venta." },
      { status: 403 }
    );
  }

  const existing = await prisma.salesMandate.findUnique({
    where: { userId: session.userId },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya has firmado el mandato de venta." }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    representativeName,
    representativeDni,
    companyLegalName,
    companyCif,
    companyAddress,
    contactEmail,
    contactPhone,
    companyTradeName,
    companySector,
    companyCnae,
    companyFoundedYear,
    employeeCount,
    lastRevenueEur,
    lastEbitdaEur,
    expectedSalePriceEur,
    saleReason,
    signaturePngBase64,
    termsAccepted,
  } = body;

  if (
    !companyLegalName?.trim() ||
    !companyCif?.trim() ||
    !companyAddress?.trim() ||
    !contactEmail?.trim() ||
    !signaturePngBase64 ||
    !termsAccepted
  ) {
    return NextResponse.json({ error: "Faltan datos obligatorios o la aceptación de términos." }, { status: 400 });
  }

  const signedAt = new Date();
  const clientIp = getClientIP(req.headers);
  const userAgent = req.headers.get("user-agent");

  const payload = {
    representativeName: representativeName != null ? String(representativeName).trim() : "",
    representativeDni: representativeDni != null ? String(representativeDni).trim() : "",
    companyLegalName: String(companyLegalName).trim(),
    companyCif: String(companyCif).trim(),
    companyAddress: String(companyAddress).trim(),
    contactEmail: String(contactEmail).trim(),
    contactPhone: contactPhone ? String(contactPhone).trim() : null,
    companyTradeName: companyTradeName ? String(companyTradeName).trim() : null,
    companySector: companySector ? String(companySector).trim() : null,
    companyCnae: companyCnae ? String(companyCnae).trim() : null,
    companyFoundedYear: typeof companyFoundedYear === "number" ? companyFoundedYear : null,
    employeeCount: typeof employeeCount === "number" ? employeeCount : null,
    lastRevenueEur: typeof lastRevenueEur === "number" ? lastRevenueEur : null,
    lastEbitdaEur: typeof lastEbitdaEur === "number" ? lastEbitdaEur : null,
    expectedSalePriceEur: typeof expectedSalePriceEur === "number" ? expectedSalePriceEur : null,
    saleReason: saleReason ? String(saleReason).trim() : null,
    signaturePngBase64: String(signaturePngBase64),
    signedAt,
    clientIp,
    userAgent,
  };

  const pdfBytes = await generateSignedMandatePdf(payload);
  const pdfFileName = `mandato-venta-diligenz-${signedAt.toISOString().slice(0, 10)}.pdf`;

  try {
    await syncUserDriveFolderName({
      userId: session.userId,
      role: session.user.role,
      personName: payload.representativeName || payload.companyLegalName,
      companyName: payload.companyLegalName,
    });
    await syncDocumentToUserDrive({
      userId: session.userId,
      kind: "mandato",
      originalFileName: pdfFileName,
      mimeType: "application/pdf",
      content: Buffer.from(pdfBytes),
      companyName: payload.companyLegalName,
    });
  } catch (driveError) {
    console.error("[mandato/sign] google drive error:", driveError);
  }

  await prisma.$transaction([
    prisma.salesMandate.create({
      data: {
        userId: session.userId,
        representativeName: payload.representativeName,
        representativeDni: payload.representativeDni,
        companyLegalName: payload.companyLegalName,
        companyCif: payload.companyCif,
        companyAddress: payload.companyAddress,
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        companyTradeName: payload.companyTradeName,
        companySector: payload.companySector,
        companyCnae: payload.companyCnae,
        companyFoundedYear: payload.companyFoundedYear,
        employeeCount: payload.employeeCount,
        lastRevenueEur: payload.lastRevenueEur,
        lastEbitdaEur: payload.lastEbitdaEur,
        expectedSalePriceEur: payload.expectedSalePriceEur,
        saleReason: payload.saleReason,
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
  const pdfAttachment = {
    filename: pdfFileName,
    content: Buffer.from(pdfBytes),
  };

  let userEmailSent = false;
  let internalEmailSent = false;

  try {
    userEmailSent = await sendEmail({
      to: emailTo,
      subject: "Copia de tu Mandato de Venta firmado — Diligenz",
      text: `Hola ${payload.representativeName || payload.companyLegalName},\n\nAdjuntamos copia del Mandato de Venta que has firmado electrónicamente en Diligenz el ${signedAtLabel}.\n\nConserva este documento para tu registro.\n\nDILIGENZ`,
      attachments: [pdfAttachment],
    });
  } catch (e) {
    console.error("[mandato/sign] email vendedor error:", e);
  }

  if (emailTo.toLowerCase() !== diligenzNotifyEmail.toLowerCase()) {
    try {
      internalEmailSent = await sendEmail({
        to: diligenzNotifyEmail,
        subject: `Nuevo mandato firmado — ${payload.companyLegalName}`,
        text: `Se ha firmado un nuevo Mandato de Venta en Diligenz.\n\nEmpresa: ${payload.companyLegalName} (${payload.companyCif})\nRepresentante: ${payload.representativeName || payload.representativeDni ? `${payload.representativeName || "—"} (${payload.representativeDni || "—"})` : "No indicado"}\nEmail contacto: ${payload.contactEmail}\nTeléfono: ${payload.contactPhone ?? "—"}\nFecha de firma: ${signedAtLabel}\n\nAdjunto el PDF firmado.`,
        attachments: [pdfAttachment],
      });
    } catch (e) {
      console.error("[mandato/sign] email info@diligenz error:", e);
    }
  } else {
    internalEmailSent = userEmailSent;
  }

  if (!userEmailSent) {
    console.warn("[mandato/sign] PDF firmado OK; correo al vendedor no enviado (revisa SMTP)");
  }
  if (!internalEmailSent) {
    console.warn(
      "[mandato/sign] PDF firmado OK; copia interna no enviada a",
      diligenzNotifyEmail
    );
  }

  return new NextResponse(new Uint8Array(Buffer.from(pdfBytes)), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mandato-venta-diligenz.pdf"`,
    },
  });
}
