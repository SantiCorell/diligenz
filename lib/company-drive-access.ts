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
