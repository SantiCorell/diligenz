import fs from "fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const data = new Uint8Array(
  fs.readFileSync("public/legal/mandato-venta-condiciones-particulares-2026.pdf")
);
const doc = await pdfjs.getDocument({ data }).promise;
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  const { width, height } = page.getViewport({ scale: 1 });
  console.log(`--- PAGE ${p} (${width}x${height}) ---`);
  for (const item of content.items) {
    if ("str" in item && item.str.trim()) {
      const t = item.transform;
      console.log(JSON.stringify({ str: item.str.slice(0, 80), x: +t[4].toFixed(1), y: +t[5].toFixed(1) }));
    }
  }
}
