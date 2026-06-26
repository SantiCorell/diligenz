import type { RequestStatus } from "@prisma/client";

/** Compradores con solicitud en gestión pueden ver la carpeta Drive del negocio. */
export function buyerCanSeeCompanyDriveFolder(
  status: RequestStatus | null | undefined
): boolean {
  return status === "MANAGED";
}

/** Teaser/documento en Drive: solicitud en gestión y admin lo ha habilitado. */
export function buyerCanDownloadCompanyTeaser(opts: {
  requestStatus: RequestStatus | null | undefined;
  attachmentsApproved: boolean;
  buyerTeaserUrl: string | null | undefined;
}): boolean {
  const url = opts.buyerTeaserUrl?.trim();
  return (
    Boolean(url) &&
    opts.attachmentsApproved &&
    buyerCanSeeCompanyDriveFolder(opts.requestStatus)
  );
}
