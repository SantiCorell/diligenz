import JSZip from "jszip";
import type { SalesMandateVariantId } from "./clauses";
import type { SignedVentaDocuments } from "./mandato-types";

export async function zipVentaDocuments(docs: SignedVentaDocuments): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(docs.particularesFileName, docs.particularesPdf);
  zip.file(docs.generalesFileName, docs.generalesPdf);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export function ventaZipFileName(
  signedAt: Date,
  variant: SalesMandateVariantId = "EXCLUSIVE"
): string {
  const date = signedAt.toISOString().slice(0, 10);
  return variant === "NON_EXCLUSIVE"
    ? `mandato-venta-sin-exclusividad-diligenz-${date}.zip`
    : `mandato-venta-diligenz-${date}.zip`;
}
