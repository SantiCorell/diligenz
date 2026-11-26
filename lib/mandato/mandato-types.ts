export type MandatoSignPayload = {
  representativeName: string;
  representativeDni: string;
  companyLegalName: string;
  companyCif: string;
  companyAddress: string;
  contactEmail: string;
  contactPhone?: string | null;
  companyTradeName?: string | null;
  companySector?: string | null;
  companyCnae?: string | null;
  companyFoundedYear?: number | null;
  employeeCount?: number | null;
  lastRevenueEur?: number | null;
  lastEbitdaEur?: number | null;
  expectedSalePriceEur?: number | null;
  saleReason?: string | null;
  signaturePngBase64: string;
  signedAt: Date;
  clientIp?: string | null;
  userAgent?: string | null;
};

export type SignedVentaDocuments = {
  particularesPdf: Uint8Array;
  generalesPdf: Uint8Array;
  particularesFileName: string;
  generalesFileName: string;
};
