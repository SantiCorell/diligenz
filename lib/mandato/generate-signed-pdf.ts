import fs from "fs";
import path from "path";
import { PDFDocument, PDFName, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { SalesMandateVariantId } from "./clauses";
import type { MandatoSignPayload, SignedVentaDocuments } from "./mandato-types";

export type { MandatoSignPayload, SignedVentaDocuments } from "./mandato-types";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public/legal/mandato-venta-condiciones-particulares-2026.pdf"
);

const NON_EXCLUSIVE_TEMPLATE_PATH = path.join(
  process.cwd(),
  "public/legal/mandato-venta-sin-exclusividad-condiciones-particulares-2026.pdf"
);

const GENERALES_TEMPLATE_PATH = path.join(
  process.cwd(),
  "public/legal/condiciones-generales-mandato-venta-2026.pdf"
);

const NON_EXCLUSIVE_GENERALES_TEMPLATE_PATH = path.join(
  process.cwd(),
  "public/legal/condiciones-generales-mandato-venta-sin-exclusividad-2026.pdf"
);

/** Signature block on the last page of each Condiciones Generales de venta PDF. */
const GENERALES_STAMP = {
  EXCLUSIVE: {
    signature: { x: 340, y: 250, width: 160, maxHeight: 72 },
    name: { x: 378, y: 214 },
    nif: { x: 370, y: 204, size: 8 },
  },
  NON_EXCLUSIVE: {
    signature: { x: 340, y: 366, width: 150, maxHeight: 48 },
    name: { x: 376, y: 339 },
    nif: { x: 368, y: 329, size: 8 },
  },
} as const;

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** StandardFonts usan WinAnsi: sin ≤, comillas tipográficas, etc. */
function pdfSafeText(text: string): string {
  const replacements: [string, string][] = [
    ["\u2264", "<="],
    ["\u2265", ">="],
    ["\u2260", "!="],
    ["\u2014", "-"],
    ["\u2013", "-"],
    ["\u2026", "..."],
    ["\u2018", "'"],
    ["\u2019", "'"],
    ["\u201C", '"'],
    ["\u201D", '"'],
    ["\u202F", " "],
    ["\u00A0", " "],
  ];
  let out = text;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return Array.from(out)
    .map((ch) => (ch.codePointAt(0)! <= 0xff ? ch : "?"))
    .join("");
}

function stripDataUrl(b64: string): string {
  const i = b64.indexOf(",");
  return i >= 0 ? b64.slice(i + 1) : b64;
}

function fillField(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  width: number,
  size = 9
) {
  const safe = pdfSafeText(text);
  if (!safe.trim()) return;
  page.drawRectangle({
    x,
    y: y - 2,
    width,
    height: size + 5,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });
  page.drawText(safe, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
}

function markCheckbox(page: PDFPage, font: PDFFont, x: number, y: number) {
  page.drawText("X", { x: x + 2, y: y - 1, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
}

function signedDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1) - 1;
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return { day, monthName: MONTHS_ES[month] ?? "", year };
}

export async function generateSignedMandatePdf(
  data: MandatoSignPayload,
  variant: SalesMandateVariantId = "EXCLUSIVE"
): Promise<Uint8Array> {
  if (variant === "NON_EXCLUSIVE") {
    return generateSignedNonExclusiveMandatePdf(data);
  }
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdf = await PDFDocument.load(templateBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  const p1 = pages[0];
  const p2 = pages[1];
  const p3 = pages[2];

  const sellerName = data.companyLegalName;
  const sellerCif = data.companyCif;
  const sellerAddress = data.companyAddress;
  const companyName = data.companyTradeName?.trim() || data.companyLegalName;

  // Página 1 — EL VENDEDOR
  fillField(p1, font, sellerName, 180, 446, 95);
  fillField(p1, font, sellerCif, 340, 446, 90);
  fillField(p1, font, sellerAddress, 130, 416, 200);
  fillField(p1, font, data.contactEmail, 130, 387, 140);
  if (data.contactPhone) fillField(p1, font, data.contactPhone, 340, 377, 90);
  if (data.representativeName) fillField(p1, font, data.representativeName, 160, 347, 200);
  if (data.representativeDni) fillField(p1, font, data.representativeDni, 130, 319, 90);

  // Página 1 — LA COMPAÑÍA EN VENTA
  fillField(p1, font, companyName, 160, 205, 200);
  fillField(p1, font, sellerCif, 90, 175, 120);
  fillField(p1, font, sellerAddress, 140, 145, 200);

  // Página 2 — declaraciones aceptadas (sección 5)
  const declarationYs = [219.3, 206.0, 192.6, 179.3, 156.0, 142.6];
  for (const y of declarationYs) {
    markCheckbox(p2, font, 74.7, y);
  }

  // Página 3 — fecha y firma del vendedor
  const { day, monthName, year } = signedDateParts(data.signedAt);
  fillField(p3, font, day, 248, 724, 28);
  fillField(p3, font, monthName, 280, 724, 80);
  fillField(p3, font, year, 390, 724, 50);

  const pngBytes = Uint8Array.from(Buffer.from(stripDataUrl(data.signaturePngBase64), "base64"));
  const sigImage = await pdf.embedPng(pngBytes);
  const sigW = 160;
  const sigH = (sigImage.height / sigImage.width) * sigW;
  p3.drawImage(sigImage, { x: 320, y: 500, width: sigW, height: sigH });

  const signatoryName = data.representativeName?.trim() || sellerName;
  fillField(p3, font, signatoryName, 360, 458, 150);
  fillField(p3, font, sellerCif, 360, 448, 150);

  return pdf.save();
}

async function generateSignedNonExclusiveMandatePdf(
  data: MandatoSignPayload
): Promise<Uint8Array> {
  const templateBytes = fs.readFileSync(NON_EXCLUSIVE_TEMPLATE_PATH);
  const pdf = await PDFDocument.load(templateBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const [p1, p2, p3] = pdf.getPages();

  const sellerName = data.companyLegalName;
  const sellerCif = data.companyCif;
  const companyName = data.companyTradeName?.trim() || data.companyLegalName;

  fillField(p1, font, sellerName, 152, 446, 120, 8);
  fillField(p1, font, sellerCif, 330, 446, 180, 8);
  fillField(p1, font, data.companyAddress, 128, 417.6, 390, 8);
  fillField(p1, font, data.contactEmail, 125, 378.9, 145, 8);
  if (data.contactPhone) fillField(p1, font, data.contactPhone, 330, 378.9, 180, 8);
  if (data.representativeName) fillField(p1, font, data.representativeName, 168, 350, 340, 8);
  if (data.representativeDni) fillField(p1, font, data.representativeDni, 145, 311.4, 120, 8);

  fillField(p1, font, companyName, 168, 209.8, 350, 8);
  fillField(p1, font, sellerCif, 120, 180.3, 145, 8);
  fillField(p1, font, data.companyAddress, 155, 150.5, 360, 8);

  for (const y of [111.6, 98.3, 84.9, 71.6]) {
    markCheckbox(p2, font, 74.8, y);
  }
  for (const y of [756, 721.9]) {
    markCheckbox(p3, font, 74.8, y);
  }

  const { day, monthName, year } = signedDateParts(data.signedAt);
  p3.drawRectangle({
    x: 168,
    y: 626,
    width: 370,
    height: 14,
    color: rgb(1, 1, 1),
  });
  p3.drawText(pdfSafeText(`En Valencia, a ${day} de ${monthName} de ${year}`), {
    x: 175,
    y: 631.4,
    size: 9,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  const pngBytes = Uint8Array.from(Buffer.from(stripDataUrl(data.signaturePngBase64), "base64"));
  const sigImage = await pdf.embedPng(pngBytes);
  const sigW = 140;
  const sigH = Math.min((sigImage.height / sigImage.width) * sigW, 72);
  p3.drawImage(sigImage, { x: 340, y: 478, width: sigW, height: sigH });

  const signatoryName = data.representativeName?.trim() || sellerName;
  fillField(p3, font, signatoryName, 385, 464.8, 150, 8);
  fillField(p3, font, sellerCif, 375, 455.4, 155, 8);

  return pdf.save();
}

function coverSignatureLine(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number
) {
  const safe = pdfSafeText(text);
  if (!safe.trim()) return;
  page.drawRectangle({
    x,
    y: y - 1.5,
    width,
    height: size + 2,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });
  page.drawText(safe, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
}

function stripAcroForm(pdf: PDFDocument) {
  for (const page of pdf.getPages()) {
    if (page.node.has(PDFName.of("Annots"))) {
      page.node.delete(PDFName.of("Annots"));
    }
  }
  if (pdf.catalog.has(PDFName.of("AcroForm"))) {
    pdf.catalog.delete(PDFName.of("AcroForm"));
  }
}

async function embedSignature(
  pdf: PDFDocument,
  page: PDFPage,
  signaturePngBase64: string,
  x: number,
  y: number,
  width: number,
  maxHeight: number
) {
  const pngBytes = Uint8Array.from(Buffer.from(stripDataUrl(signaturePngBase64), "base64"));
  const sigImage = await pdf.embedPng(pngBytes);
  let sigW = width;
  let sigH = (sigImage.height / sigImage.width) * sigW;
  if (sigH > maxHeight) {
    sigH = maxHeight;
    sigW = (sigImage.width / sigImage.height) * sigH;
  }
  page.drawImage(sigImage, { x, y, width: sigW, height: sigH });
}

export async function generateSignedVentaGeneralesPdf(
  data: MandatoSignPayload,
  variant: SalesMandateVariantId = "EXCLUSIVE"
): Promise<Uint8Array> {
  const templatePath =
    variant === "NON_EXCLUSIVE" ? NON_EXCLUSIVE_GENERALES_TEMPLATE_PATH : GENERALES_TEMPLATE_PATH;
  if (!fs.existsSync(templatePath)) {
    throw new Error("Plantilla de Condiciones Generales de venta no encontrada.");
  }

  const pdf = await PDFDocument.load(fs.readFileSync(templatePath));
  stripAcroForm(pdf);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const signPage = pdf.getPages()[pdf.getPageCount() - 1];
  const stamp = GENERALES_STAMP[variant];
  const signatoryName = data.representativeName?.trim() || data.companyLegalName;

  await embedSignature(
    pdf,
    signPage,
    data.signaturePngBase64,
    stamp.signature.x,
    stamp.signature.y,
    stamp.signature.width,
    stamp.signature.maxHeight
  );
  coverSignatureLine(signPage, font, signatoryName, stamp.name.x, stamp.name.y, 130, 9);
  coverSignatureLine(signPage, font, data.companyCif, stamp.nif.x, stamp.nif.y, 120, stamp.nif.size);

  return pdf.save();
}

export async function generateSignedVentaDocuments(
  data: MandatoSignPayload,
  variant: SalesMandateVariantId = "EXCLUSIVE"
): Promise<SignedVentaDocuments> {
  const date = data.signedAt.toISOString().slice(0, 10);
  const nonExclusive = variant === "NON_EXCLUSIVE";
  const [particularesPdf, generalesPdf] = await Promise.all([
    generateSignedMandatePdf(data, variant),
    generateSignedVentaGeneralesPdf(data, variant),
  ]);

  return {
    particularesPdf,
    generalesPdf,
    particularesFileName: nonExclusive
      ? `mandato-venta-sin-exclusividad-particulares-diligenz-${date}.pdf`
      : `mandato-venta-particulares-diligenz-${date}.pdf`,
    generalesFileName: nonExclusive
      ? `condiciones-generales-mandato-venta-sin-exclusividad-diligenz-${date}.pdf`
      : `condiciones-generales-mandato-venta-diligenz-${date}.pdf`,
  };
}
