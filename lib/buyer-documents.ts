/** Documento/enlace visible para compradores con solicitud validada. */
export type BuyerDocument = {
  label: string;
  url: string;
  sortOrder: number;
};

export function parseBuyerDocuments(raw: unknown): BuyerDocument[] {
  if (!Array.isArray(raw)) return [];
  const docs: BuyerDocument[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const label = String((item as BuyerDocument).label ?? "").trim();
    const url = String((item as BuyerDocument).url ?? "").trim();
    if (!label || !url) return;
    const sortOrderRaw = (item as BuyerDocument).sortOrder;
    const sortOrder =
      typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
        ? sortOrderRaw
        : index;
    docs.push({ label, url, sortOrder });
  });
  return docs.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Combina buyerDocuments (nuevo) con buyerTeaserUrl (legacy, un solo enlace). */
export function resolveBuyerDocuments(
  buyerDocuments: unknown,
  buyerTeaserUrl?: string | null
): BuyerDocument[] {
  const fromJson = parseBuyerDocuments(buyerDocuments);
  if (fromJson.length > 0) return fromJson;
  const legacy = buyerTeaserUrl?.trim();
  if (!legacy) return [];
  return [{ label: "Documento / teaser", url: legacy, sortOrder: 0 }];
}

export function buyerDocumentsMeaningful(
  buyerDocuments: unknown,
  buyerTeaserUrl?: string | null
): boolean {
  return resolveBuyerDocuments(buyerDocuments, buyerTeaserUrl).length > 0;
}

/** Parsea JSON enviado desde el formulario admin. */
export function parseBuyerDocumentsJson(raw: string | null | undefined): BuyerDocument[] {
  if (!raw?.trim()) return [];
  try {
    return parseBuyerDocuments(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function serializeBuyerDocumentsForForm(docs: BuyerDocument[]): string {
  return JSON.stringify(
    docs.map((doc, index) => ({
      label: doc.label,
      url: doc.url,
      sortOrder: index,
    }))
  );
}
