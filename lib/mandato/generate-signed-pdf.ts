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
