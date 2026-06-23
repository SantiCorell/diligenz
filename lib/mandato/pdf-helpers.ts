import { StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";

export const MONTHS_ES = [
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
] as const;

/** StandardFonts usan WinAnsi: sin ≤, comillas tipográficas, etc. */
export function pdfSafeText(text: string): string {
  const replacements: [string, string][] = [
    ["\u2264", "<="],
    ["\u2265", ">="],
    ["\u2260", "!="],
    ["\u20ac", "EUR"],
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

export function stripDataUrl(b64: string): string {
  const i = b64.indexOf(",");
  return i >= 0 ? b64.slice(i + 1) : b64;
}

export function signedDateParts(date: Date) {
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

export function fillField(
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

export function markCheckbox(page: PDFPage, font: PDFFont, x: number, y: number) {
  page.drawText("X", { x: x + 2, y: y - 1, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
}

export function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = pdfSafeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function drawParagraph(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  lineHeight: number,
  color = rgb(0.1, 0.1, 0.1)
): number {
  let cy = y;
  for (const line of wrapText(text, maxWidth, font, size)) {
    page.drawText(line, { x, y: cy, size, font, color });
    cy -= lineHeight;
  }
  return cy;
}

export function drawHeading(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number
) {
  page.drawText(pdfSafeText(text), { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
}

export async function embedStandardFonts(pdf: import("pdf-lib").PDFDocument) {
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { regular, bold };
}
