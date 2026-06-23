export type ColaboracionSignPayload = {
  professionalLegalName: string;
  professionalNif: string;
  professionalAddress: string;
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

export type SignedColaboracionDocuments = {
  particularesPdf: Uint8Array;
  generalesPdf: Uint8Array;
  particularesFileName: string;
  generalesFileName: string;
};
