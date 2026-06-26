export function entityTypeLabel(t: string | null | undefined): string {
  if (t === "EMPRESA") return "Empresa";
  if (t === "AUTONOMO") return "Profesional / Autónomo";
  if (t === "STARTUP") return "Startup (histórico)";
  if (t === "MARKETPLACE") return "Marketplace (histórico)";
  return "—";
}

export function formatCompanyMoney(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  if (typeof value === "number") return `${value.toLocaleString("es-ES")} €`;
  const trimmed = String(value).trim();
  if (!trimmed) return "—";
  const digits = trimmed.replace(/\s/g, "");
  if (/^-?\d+([.,]\d+)?$/.test(digits)) {
    const n = Number(digits.replace(",", "."));
    if (Number.isFinite(n)) return `${n.toLocaleString("es-ES")} €`;
  }
  return trimmed.includes("€") ? trimmed : `${trimmed} €`;
}

export function displaySalePrice(valuation: {
  salePriceMin: number | null;
  salePriceMax: number | null;
} | null | undefined): string | null {
  if (!valuation) return null;
  const { salePriceMin, salePriceMax } = valuation;
  if (salePriceMin == null && salePriceMax == null) return null;
  if (
    salePriceMin != null &&
    salePriceMax != null &&
    salePriceMin === salePriceMax
  ) {
    return `${salePriceMin.toLocaleString("es-ES")} €`;
  }
  const lo = salePriceMin ?? salePriceMax!;
  const hi = salePriceMax ?? salePriceMin!;
  return `${lo.toLocaleString("es-ES")} € – ${hi.toLocaleString("es-ES")} €`;
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
