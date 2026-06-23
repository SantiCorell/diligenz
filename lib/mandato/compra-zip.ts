import JSZip from "jszip";
import type { SignedCompraDocuments } from "./mandato-compra-types";

export async function zipCompraDocuments(docs: SignedCompraDocuments): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(docs.particularesFileName, docs.particularesPdf);
  zip.file(docs.generalesFileName, docs.generalesPdf);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export function compraZipFileName(signedAt: Date): string {
  return `mandato-compra-diligenz-${signedAt.toISOString().slice(0, 10)}.zip`;
}
