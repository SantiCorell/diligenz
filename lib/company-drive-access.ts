import type { RequestStatus } from "@prisma/client";
import {
  buyerDocumentsMeaningful,
  type BuyerDocument,
} from "@/lib/buyer-documents";
import { buyerHasTeaserAccess, normalizeRequestStatus } from "@/lib/info-request-pipeline";

/**
 * La carpeta se abre si el comprador ya tenía el teaser, pulsó «Quiero avanzar»
 * y la empresa tiene enlace. No hay un permiso aparte.
 */
export function buyerCanOpenCompanyDriveFolder(opts: {
  requestStatus: string | null | undefined;
  driveFolderUrl?: string | null;
}): boolean {
  if (!opts.driveFolderUrl?.trim()) return false;
  if (!buyerHasTeaserAccess(opts.requestStatus)) return false;
  const stage = normalizeRequestStatus(opts.requestStatus);
  return stage === "CONVERSATIONS" || stage === "CLOSED";
}

/** Compradores con teaser concedido pueden ver la documentación de la empresa. */
export function buyerCanSeeCompanyDriveFolder(
  status: RequestStatus | null | undefined
): boolean {
  return buyerHasTeaserAccess(status);
}

/** El comprador ve el teaser en cuanto su solicitud está en teaser y la empresa tiene el documento. */
export function buyerCanAccessCompanyDocuments(opts: {
  requestStatus: RequestStatus | null | undefined;
  buyerDocuments?: unknown;
  buyerTeaserUrl?: string | null | undefined;
  /** Se ignora: el acceso lo decide el estado de la solicitud. */
  attachmentsApproved?: boolean;
}): boolean {
  return (
    buyerDocumentsMeaningful(opts.buyerDocuments, opts.buyerTeaserUrl) &&
    buyerCanSeeCompanyDriveFolder(opts.requestStatus)
  );
}

/** @deprecated Usa buyerCanAccessCompanyDocuments */
export function buyerCanDownloadCompanyTeaser(opts: {
  requestStatus: RequestStatus | null | undefined;
  attachmentsApproved?: boolean;
  buyerTeaserUrl: string | null | undefined;
  buyerDocuments?: unknown;
}): boolean {
  return buyerCanAccessCompanyDocuments(opts);
}

export type { BuyerDocument };
