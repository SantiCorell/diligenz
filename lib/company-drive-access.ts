import type { RequestStatus } from "@prisma/client";
import {
  buyerDocumentsMeaningful,
  type BuyerDocument,
} from "@/lib/buyer-documents";
import { buyerHasTeaserAccess } from "@/lib/info-request-pipeline";

/** Compradores con teaser concedido pueden ver la documentación de la empresa. */
export function buyerCanSeeCompanyDriveFolder(
  status: RequestStatus | null | undefined
): boolean {
  return buyerHasTeaserAccess(status);
}

/** Documentos para compradores: solicitud en gestión y admin lo ha habilitado. */
export function buyerCanAccessCompanyDocuments(opts: {
  requestStatus: RequestStatus | null | undefined;
  attachmentsApproved: boolean;
  buyerDocuments?: unknown;
  buyerTeaserUrl?: string | null | undefined;
}): boolean {
  return (
    buyerDocumentsMeaningful(opts.buyerDocuments, opts.buyerTeaserUrl) &&
    opts.attachmentsApproved &&
    buyerCanSeeCompanyDriveFolder(opts.requestStatus)
  );
}

/** @deprecated Usa buyerCanAccessCompanyDocuments */
export function buyerCanDownloadCompanyTeaser(opts: {
  requestStatus: RequestStatus | null | undefined;
  attachmentsApproved: boolean;
  buyerTeaserUrl: string | null | undefined;
  buyerDocuments?: unknown;
}): boolean {
  return buyerCanAccessCompanyDocuments(opts);
}

export type { BuyerDocument };
