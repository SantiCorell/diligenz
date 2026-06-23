export type MandatoCompraSignPayload = {
  buyerLegalName: string;
  buyerNifCif: string;
  buyerAddress: string;
  contactEmail: string;
  contactPhone?: string | null;
  representativeName: string;
  representativeDni: string;
  representativeRole?: string | null;
  signaturePngBase64: string;
  signedAt: Date;
  clientIp?: string | null;
  userAgent?: string | null;
};

export type SignedCompraDocuments = {
  particularesPdf: Uint8Array;
  generalesPdf: Uint8Array;
  particularesFileName: string;
  generalesFileName: string;
};
