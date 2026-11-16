import { formatEuroAmountFromString, formatEuroRange } from "@/lib/format-financial";

/** Tipo de operación. Los códigos antiguos de tipo de entidad se siguen leyendo, pero ya no se ofrecen. */
export const OPERATION_TYPE_OPTIONS = [
  { value: "ACCIONES_PARTICIPACIONES", label: "Compraventa de acciones o participaciones" },
  { value: "UNIDAD_ECONOMICA", label: "Compraventa de la unidad económica" },
] as const;

export const OPERATION_TYPES = OPERATION_TYPE_OPTIONS.map((option) => option.value);

/** Valores históricos de tipo de entidad. No equivalen a un tipo de operación. */
export const LEGACY_ENTITY_TYPES = ["EMPRESA", "AUTONOMO", "STARTUP", "MARKETPLACE"] as const;

export function isOperationType(
  t: string | null | undefined
): t is (typeof OPERATION_TYPE_OPTIONS)[number]["value"] {
  return t === "ACCIONES_PARTICIPACIONES" || t === "UNIDAD_ECONOMICA";
}

export function entityTypeLabel(t: string | null | undefined): string {
  const operation = OPERATION_TYPE_OPTIONS.find((option) => option.value === t);
  if (operation) return operation.label;
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
      ((item as DocumentLink).url.includes("drive.google.com") ||
        (item as DocumentLink).url.includes("docs.google.com"))
    ) {
      return (item as DocumentLink).url;
    }
  }
  return null;
}
