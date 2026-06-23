import JSZip from "jszip";
import type { SignedColaboracionDocuments } from "./colaboracion-types";

export async function zipColaboracionDocuments(
  docs: SignedColaboracionDocuments
): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(docs.particularesFileName, docs.particularesPdf);
  zip.file(docs.generalesFileName, docs.generalesPdf);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export function colaboracionZipFileName(signedAt: Date): string {
  return `acuerdo-colaboracion-diligenz-${signedAt.toISOString().slice(0, 10)}.zip`;
}
