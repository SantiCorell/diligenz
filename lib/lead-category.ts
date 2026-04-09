/** Categorías CRM de leads (valoración y contacto). */
export const LEAD_CATEGORIES = ["pendiente", "gestionado", "rechazado"] as const;
export type LeadCategory = (typeof LEAD_CATEGORIES)[number];

export const LEAD_CATEGORY_LABELS: Record<LeadCategory, string> = {
  pendiente: "Pendiente",
  gestionado: "Gestionado",
  rechazado: "Rechazado",
};

export function isLeadCategory(v: string | null | undefined): v is LeadCategory {
  return v != null && LEAD_CATEGORIES.includes(v as LeadCategory);
}

export function normalizeLeadCategory(v: string | null | undefined): LeadCategory {
  if (isLeadCategory(v)) return v;
  return "pendiente";
}
