import fs from "fs";
import path from "path";
import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import type { MandatoCompraSignPayload, SignedCompraDocuments } from "./mandato-compra-types";
import {
  drawHeading,
  drawParagraph,
  embedStandardFonts,
  fillField,
  markCheckbox,
  signedDateParts,
  stripDataUrl,
} from "./pdf-helpers";

export type { MandatoCompraSignPayload, SignedCompraDocuments } from "./mandato-compra-types";

const PARTICULARES_TEMPLATE = path.join(
  process.cwd(),
  "public/legal/mandato-compra-condiciones-particulares-2026.pdf"
);

const GENERALES_TEMPLATE = path.join(
  process.cwd(),
  "public/legal/condiciones-generales-mandato-compra-2026.pdf"
);

const INTERMEDIARY = {
  name: "Jose Angel Canizares Llorca",
  nif: "23848753F",
  address: "C/ Colon 39, 1o, 46004 Valencia",
  email: "jose@diligenz.com",
};

const BUYER_OBLIGATIONS = [
  "Manifestar interes real y actuar de buena fe en todo el proceso de analisis, valoracion y negociacion.",
  "Participar de forma activa y diligente, respondiendo con prontitud a las comunicaciones de DILIGENZ.",
  "Analizar con la debida diligencia profesional la documentacion contenida en los cuadernos de venta.",
  "Comunicar a DILIGENZ su decision de avanzar o desistir en el proceso de cada compania analizada.",
  "Garantizar solvencia economica y capacidad financiera suficiente para afrontar la adquisicion.",
  "No utilizar la informacion confidencial para fines distintos a la evaluacion de la adquisicion.",
  "Respetar el canal de intermediacion de DILIGENZ durante el periodo de exclusividad.",
  "No captar empleados clave, clientes o proveedores de las companias durante el proceso y los 12 meses posteriores.",
];

const BUYER_DECLARATIONS = [
  "Que ostenta la titularidad y/o representacion suficiente para suscribir este encargo.",
  "Que la informacion facilitada es veridica, completa y no induce a error.",
  "Que cuenta con capacidad economica y financiera real para afrontar la adquisicion de empresas de interes.",
  "Que ha leido y acepta integramente las Condiciones Generales de DILIGENZ incorporadas al presente Mandato.",
  "Que ha sido informado del regimen de confidencialidad, exclusividad y honorarios aplicables.",
  "Que acepta recibir comunicaciones de DILIGENZ por correo electronico en relacion con el proceso.",
];

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

async function generateParticularesFromTemplate(
  data: MandatoCompraSignPayload
): Promise<Uint8Array | null> {
  if (!fs.existsSync(PARTICULARES_TEMPLATE)) return null;

  const templateBytes = fs.readFileSync(PARTICULARES_TEMPLATE);
  const pdf = await PDFDocument.load(templateBytes);
  const { regular: font } = await embedStandardFonts(pdf);
  const pages = pdf.getPages();
  const p1 = pages[0];
  const p2 = pages[1];
  const p3 = pages[2];

  // Página 1 — EL COMPRADOR
  fillField(p1, font, data.buyerLegalName, 165, 405, 115);
  fillField(p1, font, data.buyerNifCif, 350, 405, 90);
  fillField(p1, font, data.buyerAddress, 108, 377, 380);
  fillField(p1, font, data.contactEmail, 155, 349, 120);
  if (data.contactPhone) fillField(p1, font, data.contactPhone, 350, 349, 90);
  fillField(p1, font, data.representativeName, 155, 321, 200);
  fillField(p1, font, data.representativeDni, 175, 293, 100);
  if (data.representativeRole) fillField(p1, font, data.representativeRole, 380, 293, 120);

  // Página 2 — fecha y declaraciones
  const { day, monthName, year } = signedDateParts(data.signedAt);
  fillField(p2, font, day, 262, 87, 28);
  fillField(p2, font, monthName, 295, 87, 120);
  fillField(p2, font, year, 500, 87, 40);

  for (const y of [248.1, 234.8, 221.4, 208.1, 194.7, 181.4]) {
    markCheckbox(p2, font, 68.1, y);
  }

  // Página 3 — firma del comprador
  await embedSignature(pdf, p3, data.signaturePngBase64, 320, 610);
  fillField(p3, font, data.representativeName, 380, 571, 150);
  fillField(p3, font, data.buyerNifCif, 390, 561, 150);

  return pdf.save();
}

export async function generateSignedCompraGeneralesPdf(
  data: MandatoCompraSignPayload
): Promise<Uint8Array> {
  if (!fs.existsSync(GENERALES_TEMPLATE)) {
    throw new Error("Plantilla de Condiciones Generales de compra no encontrada.");
  }

  const pdf = await PDFDocument.load(fs.readFileSync(GENERALES_TEMPLATE));
  const { regular: font } = await embedStandardFonts(pdf);
  const signPage = pdf.getPages()[4];
  const nifPage = pdf.getPages()[5];

  await embedSignature(pdf, signPage, data.signaturePngBase64, 320, 130);
  fillField(signPage, font, data.representativeName, 400, 80, 150);
  fillField(nifPage, font, data.buyerNifCif, 400, 728, 150);

  return pdf.save();
}

export async function generateSignedCompraDocuments(
  data: MandatoCompraSignPayload
): Promise<SignedCompraDocuments> {
  const date = data.signedAt.toISOString().slice(0, 10);
  const [particularesPdf, generalesPdf] = await Promise.all([
    generateSignedCompraMandatePdf(data),
    generateSignedCompraGeneralesPdf(data),
  ]);

  return {
    particularesPdf,
    generalesPdf,
    particularesFileName: `mandato-compra-particulares-diligenz-${date}.pdf`,
    generalesFileName: `condiciones-generales-mandato-compra-diligenz-${date}.pdf`,
  };
}

async function generateProgrammatic(data: MandatoCompraSignPayload): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const { regular: font, bold } = await embedStandardFonts(pdf);

  const margin = 50;
  const width = 495;
  const line = 12;

  let page = pdf.addPage([595, 842]);
  let y = 800;

  drawHeading(page, bold, "MANDATO DE COMPRA", margin, y, 16);
  y -= 22;
  drawHeading(page, bold, "CONDICIONES PARTICULARES", margin, y, 12);
  y -= 20;
  y =
    drawParagraph(
      page,
      font,
      "Este Mandato de Compra, junto con las Condiciones Generales que lo acompanan, constituye un contrato vinculante entre las partes.",
      margin,
      y,
      width,
      9,
      line
    ) - 8;

  drawHeading(page, bold, "1. DATOS DE IDENTIFICACION DE LAS PARTES", margin, y, 10);
  y -= 16;
  drawHeading(page, bold, "DILIGENZ (Intermediario)", margin, y, 9);
  y -= 14;
  y =
    drawParagraph(
      page,
      font,
      `Nombre / Razon Social: ${INTERMEDIARY.name}    NIF: ${INTERMEDIARY.nif}`,
      margin,
      y,
      width,
      9,
      line
    ) - 4;
  y =
    drawParagraph(
      page,
      font,
      `Domicilio: ${INTERMEDIARY.address}    Email: ${INTERMEDIARY.email}`,
      margin,
      y,
      width,
      9,
      line
    ) - 10;

  drawHeading(page, bold, "EL COMPRADOR", margin, y, 9);
  y -= 14;
  const buyerLines = [
    `Nombre / Razon Social: ${data.buyerLegalName}`,
    `NIF / CIF: ${data.buyerNifCif}`,
    `Domicilio: ${data.buyerAddress}`,
    `Email de contacto: ${data.contactEmail}`,
    `Telefono: ${data.contactPhone ?? ""}`,
    `Representante legal: ${data.representativeName}`,
    `DNI del representante: ${data.representativeDni}`,
    `Cargo / Apoderamiento: ${data.representativeRole ?? ""}`,
  ];
  for (const row of buyerLines) {
    y = drawParagraph(page, font, row, margin, y, width, 9, line) - 2;
  }

  y -= 8;
  drawHeading(page, bold, "2. CONDICIONES PARTICULARES DEL ENCARGO", margin, y, 10);
  y -= 16;
  drawHeading(page, bold, "2.1 Objeto", margin, y, 9);
  y -= 14;
  y =
    drawParagraph(
      page,
      font,
      "El presente Mandato de Compra tiene por objeto regular las condiciones bajo las cuales DILIGENZ prestara servicios profesionales de intermediacion, asesoramiento y facilitacion del acceso a oportunidades de adquisicion de empresas publicadas en su plataforma, asi como el regimen de confidencialidad, exclusividad y honorarios aplicable a dicha relacion contractual.",
      margin,
      y,
      width,
      9,
      line
    ) - 8;

  page = pdf.addPage([595, 842]);
  y = 800;
  drawHeading(page, bold, "2.2 Periodo de exclusividad y duracion", margin, y, 9);
  y -= 14;
  y =
    drawParagraph(
      page,
      font,
      "El encargo se otorga con caracter exclusivo por un periodo de DOCE (12) meses naturales desde la fecha de firma del presente Mandato de Compra, aplicandose de forma independiente para cada compania cuyo cuaderno de venta sea facilitado a EL COMPRADOR.",
      margin,
      y,
      width,
      9,
      line
    ) - 10;

  drawHeading(page, bold, "2.3 Regimen de honorarios", margin, y, 9);
  y -= 14;
  const fees = [
    "Honorarios por Exito (Success Fee): 4% (min. 5.000 EUR) sobre el precio total de la operacion.",
    "Elaboracion contrato de compraventa: gratuito si precio <= 150.000 EUR; 1.500 EUR si precio > 150.000 EUR.",
    "Acceso a plataforma y cuadernos de venta: gratuito.",
    "Todos los importes se entienden sin IVA. Los honorarios por exito seran exigibles desde la firma del contrato de compraventa o su elevacion a publico.",
  ];
  for (const row of fees) {
    y = drawParagraph(page, font, row, margin, y, width, 9, line) - 4;
  }

  y -= 6;
  drawHeading(page, bold, "3. OBLIGACIONES DE EL COMPRADOR", margin, y, 10);
  y -= 14;
  for (const item of BUYER_OBLIGATIONS) {
    y = drawParagraph(page, font, `- ${item}`, margin, y, width, 9, line) - 2;
    if (y < 80) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }
  }

  y -= 6;
  drawHeading(page, bold, "4. DECLARACIONES Y AUTORIZACIONES DEL COMPRADOR", margin, y, 10);
  y -= 14;
  for (const item of BUYER_DECLARATIONS) {
    markCheckbox(page, font, margin, y + 2);
    y = drawParagraph(page, font, item, margin + 14, y, width - 14, 9, line) - 2;
    if (y < 80) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }
  }

  page = pdf.addPage([595, 842]);
  y = 760;
  drawHeading(page, bold, "5. FIRMAS", margin, y, 10);
  y -= 18;
  const { day, monthName, year } = signedDateParts(data.signedAt);
  drawParagraph(
    page,
    font,
    `En Valencia, a ${day} de ${monthName} de ${year}`,
    margin,
    y,
    width,
    9,
    line
  );
  y -= 40;
  drawParagraph(page, font, "Por DILIGENZ", margin, y, width, 9, line);
  y -= 14;
  drawParagraph(page, font, INTERMEDIARY.name, margin, y, width, 9, line);
  y -= 14;
  drawParagraph(page, font, `NIF: ${INTERMEDIARY.nif}`, margin, y, width, 9, line);

  const pngBytes = Uint8Array.from(Buffer.from(stripDataUrl(data.signaturePngBase64), "base64"));
  const sigImage = await pdf.embedPng(pngBytes);
  const sigW = 160;
  const sigH = (sigImage.height / sigImage.width) * sigW;
  page.drawImage(sigImage, { x: 320, y: 620, width: sigW, height: sigH });

  drawParagraph(page, font, "Por EL COMPRADOR", 300, 600, 240, 9, line);
  drawParagraph(page, font, `Nombre: ${data.representativeName}`, 300, 586, 240, 9, line);
  drawParagraph(page, font, `NIF: ${data.buyerNifCif}`, 300, 572, 240, 9, line);

  y = 120;
  drawParagraph(
    page,
    font,
    "NOTA IMPORTANTE: El presente Mandato de Compra (Condiciones Particulares) debe leerse e interpretarse conjuntamente con las Condiciones Generales de DILIGENZ, que forman parte inseparable de este contrato y se entregan adjuntas. En caso de contradiccion, prevaleceran las Condiciones Particulares.",
    margin,
    y,
    width,
    8,
    11,
    rgb(0.25, 0.25, 0.25)
  );

  return pdf.save();
}

export async function generateSignedCompraMandatePdf(
  data: MandatoCompraSignPayload
): Promise<Uint8Array> {
  const fromTemplate = await generateParticularesFromTemplate(data);
  if (fromTemplate) return fromTemplate;
  return generateProgrammatic(data);
}
