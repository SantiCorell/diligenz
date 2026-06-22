import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { MandatoSignPayload } from "./mandato-types";

export type { MandatoSignPayload } from "./mandato-types";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public/legal/mandato-venta-condiciones-particulares-2026.pdf"
);

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

function formatEur(value: number): string {
  return `${value.toLocaleString("es-ES")} EUR`;
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
  data: MandatoSignPayload
): Promise<Uint8Array> {
  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdf = await PDFDocument.load(templateBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  const p1 = pages[0];
  const p2 = pages[1];
  const p3 = pages[2];
  const p4 = pages[3];

  // Página 1 — EL VENDEDOR
  fillField(p1, font, data.companyLegalName, 172, 346, 100);
  fillField(p1, font, data.companyCif, 340, 346, 90);
  fillField(p1, font, data.companyAddress, 115, 313, 200);
  fillField(p1, font, data.contactEmail, 172, 280, 100);
  if (data.contactPhone) fillField(p1, font, data.contactPhone, 340, 280, 90);
  fillField(p1, font, data.representativeName, 172, 247, 200);
  fillField(p1, font, data.representativeDni, 172, 204, 90);

  // Página 2 — LA COMPAÑÍA
  fillField(p2, font, data.companyTradeName || data.companyLegalName, 172, 726, 200);
  fillField(p2, font, data.companyCif, 120, 692, 120);
  fillField(p2, font, data.companyAddress, 140, 659, 200);
  if (data.companySector) fillField(p2, font, data.companySector, 172, 616, 100);
  if (data.companyCnae) fillField(p2, font, data.companyCnae, 320, 616, 90);
  if (data.companyFoundedYear != null)
    fillField(p2, font, String(data.companyFoundedYear), 130, 573, 60);
  if (data.employeeCount != null) fillField(p2, font, String(data.employeeCount), 350, 573, 60);
  if (data.lastRevenueEur != null)
    fillField(p2, font, formatEur(data.lastRevenueEur), 150, 530, 100);
  if (data.lastEbitdaEur != null) fillField(p2, font, formatEur(data.lastEbitdaEur), 370, 530, 90);
  if (data.expectedSalePriceEur != null)
    fillField(p2, font, formatEur(data.expectedSalePriceEur), 220, 497, 120);
  if (data.saleReason) fillField(p2, font, data.saleReason, 170, 464, 200, 8);

  // Página 3 — fecha y declaraciones aceptadas
  const { day, monthName, year } = signedDateParts(data.signedAt);
  fillField(p3, font, day, 262, 190, 28);
  fillField(p3, font, monthName, 295, 190, 120);
  fillField(p3, font, year, 500, 190, 40);

  const declarationYs = [370.6, 357.2, 343.9, 330.5, 306.8, 293.5];
  for (const y of declarationYs) {
    markCheckbox(p3, font, 74.7, y);
  }

  // Página 4 — firma del vendedor
  const pngBytes = Uint8Array.from(Buffer.from(stripDataUrl(data.signaturePngBase64), "base64"));
  const sigImage = await pdf.embedPng(pngBytes);
  const sigW = 160;
  const sigH = (sigImage.height / sigImage.width) * sigW;
  p4.drawImage(sigImage, { x: 320, y: 610, width: sigW, height: sigH });

  fillField(p4, font, data.representativeName, 380, 598, 150);
  fillField(p4, font, data.companyCif, 360, 589, 150);

  return pdf.save();
}
