import fs from "fs";
import path from "path";
import { PDFDocument, type PDFPage } from "pdf-lib";
import type { ColaboracionSignPayload, SignedColaboracionDocuments } from "./colaboracion-types";
import {
  embedStandardFonts,
  fillField,
  markCheckbox,
  signedDateParts,
  stripDataUrl,
} from "./pdf-helpers";

export type { ColaboracionSignPayload, SignedColaboracionDocuments } from "./colaboracion-types";

const PARTICULARES_TEMPLATE = path.join(
  process.cwd(),
  "public/legal/acuerdo-colaboracion-condiciones-particulares-2026.pdf"
);

const GENERALES_TEMPLATE = path.join(
  process.cwd(),
  "public/legal/condiciones-generales-acuerdo-colaboracion-2026.pdf"
);

async function embedSignature(
  pdf: PDFDocument,
  page: PDFPage,
  signaturePngBase64: string,
  x: number,
  y: number,
  width = 160
) {
  const pngBytes = Uint8Array.from(Buffer.from(stripDataUrl(signaturePngBase64), "base64"));
  const sigImage = await pdf.embedPng(pngBytes);
  const sigH = (sigImage.height / sigImage.width) * width;
  page.drawImage(sigImage, { x, y, width, height: sigH });
}

export async function generateSignedColaboracionParticularesPdf(
  data: ColaboracionSignPayload
): Promise<Uint8Array> {
  if (!fs.existsSync(PARTICULARES_TEMPLATE)) {
    throw new Error("Plantilla de Condiciones Particulares no encontrada.");
  }

  const pdf = await PDFDocument.load(fs.readFileSync(PARTICULARES_TEMPLATE));
  const { regular: font } = await embedStandardFonts(pdf);
  const [p1, p2, p3] = pdf.getPages();

  fillField(p1, font, data.professionalLegalName, 165, 391, 115);
  fillField(p1, font, data.professionalNif, 350, 391, 90);
  fillField(p1, font, data.professionalAddress, 108, 363, 380);
  fillField(p1, font, data.contactEmail, 155, 334, 120);
  if (data.contactPhone) fillField(p1, font, data.contactPhone, 350, 334, 90);
  fillField(p1, font, data.representativeName, 155, 306, 200);
  fillField(p1, font, data.representativeDni, 175, 278, 100);
  if (data.representativeRole) fillField(p1, font, data.representativeRole, 380, 278, 120);

  const { day, monthName, year } = signedDateParts(data.signedAt);
  fillField(p2, font, day, 262, 141, 28);
  fillField(p2, font, monthName, 295, 141, 120);
  fillField(p2, font, year, 500, 141, 40);

  for (const y of [312.1, 298.7, 285.4, 272.0, 258.7, 245.3]) {
    markCheckbox(p2, font, 68.1, y);
  }

  await embedSignature(pdf, p3, data.signaturePngBase64, 320, 640);
  fillField(p3, font, data.representativeName, 380, 601, 150);
  fillField(p3, font, data.professionalNif, 390, 591, 150);

  return pdf.save();
}

export async function generateSignedColaboracionGeneralesPdf(
  data: ColaboracionSignPayload
): Promise<Uint8Array> {
  if (!fs.existsSync(GENERALES_TEMPLATE)) {
    throw new Error("Plantilla de Condiciones Generales no encontrada.");
  }

  const pdf = await PDFDocument.load(fs.readFileSync(GENERALES_TEMPLATE));
  const { regular: font } = await embedStandardFonts(pdf);
  const signPage = pdf.getPages()[4];

  await embedSignature(pdf, signPage, data.signaturePngBase64, 320, 280);
  fillField(signPage, font, data.representativeName, 380, 239, 150);
  fillField(signPage, font, data.professionalNif, 390, 229, 150);

  return pdf.save();
}

export async function generateSignedColaboracionDocuments(
  data: ColaboracionSignPayload
): Promise<SignedColaboracionDocuments> {
  const date = data.signedAt.toISOString().slice(0, 10);
  const [particularesPdf, generalesPdf] = await Promise.all([
    generateSignedColaboracionParticularesPdf(data),
    generateSignedColaboracionGeneralesPdf(data),
  ]);

  return {
    particularesPdf,
    generalesPdf,
    particularesFileName: `acuerdo-colaboracion-particulares-diligenz-${date}.pdf`,
    generalesFileName: `condiciones-generales-acuerdo-colaboracion-diligenz-${date}.pdf`,
  };
}
