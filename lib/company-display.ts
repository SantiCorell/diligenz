import { formatEuroAmountFromString, formatEuroRange } from "@/lib/format-financial";

export function entityTypeLabel(t: string | null | undefined): string {
  if (t === "EMPRESA") return "Empresa";
  if (t === "AUTONOMO") return "Profesional / Autónomo";
  if (t === "STARTUP") return "Startup (histórico)";
  if (t === "MARKETPLACE") return "Marketplace (histórico)";
  return "—";
}

export function formatCompanyMoney(value: string | number | null | undefined): string {
  return formatEuroAmountFromString(value);
}

export function displaySalePrice(valuation: {
  salePriceMin: number | null;
  salePriceMax: number | null;
} | null | undefined): string | null {
  if (!valuation) return null;
  return formatEuroRange(valuation.salePriceMin, valuation.salePriceMax);
}

export type DocumentLink = { label: string; url: string };

export function getCompanyDocumentsDriveUrl(
  documentLinks: unknown
): string | null {
  if (!Array.isArray(documentLinks)) return null;
  for (const item of documentLinks) {
    if (
      item &&
      typeof item === "object" &&
      "url" in item &&
      typeof (item as DocumentLink).url === "string" &&
      (item as DocumentLink).url.includes("drive.google.com")
    ) {
      return (item as DocumentLink).url;
    }
  }
  return null;
}
