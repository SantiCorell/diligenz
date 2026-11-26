import type { ClientServiceStatus } from "@prisma/client";
import { SL_STEPS } from "@/lib/servicios-panel";

export const CLIENT_SERVICE_STATUSES = ["PROPOSAL", "IN_PROGRESS", "COMPLETED", "DISCARDED"] as const;

export const CLIENT_SERVICE_STATUS_LABELS: Record<ClientServiceStatus, string> = {
  PROPOSAL: "Propuesta",
  IN_PROGRESS: "En marcha",
  COMPLETED: "Finalizada",
  DISCARDED: "Descartada",
};

export type ServiceTemplate = {
  id: string;
  label: string;
  title: string;
  summary: string;
  priceEur: number;
  steps: { title: string; detail?: string }[];
};

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: "constitucion-sl",
    label: "Constitución de sociedad limitada",
    title: "Constitución de sociedad limitada",
    summary: "Tramitación completa, de principio a fin. Procedimiento CIRCE / PAE.",
    priceEur: 300,
    steps: SL_STEPS.map((title) => ({ title })),
  },
  {
    id: "vacio",
    label: "Servicio en blanco",
    title: "",
    summary: "",
    priceEur: 0,
    steps: [{ title: "Primer paso" }, { title: "Segundo paso" }, { title: "Tercer paso" }],
  },
];

const MAX_PRICE_CENTS = 1_000_000 * 100;

function centsToDecimal(cents: number): string | null {
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > MAX_PRICE_CENTS) return null;
  const whole = Math.trunc(cents / 100);
  const frac = cents % 100;
  return `${whole}.${String(frac).padStart(2, "0")}`;
}

/** Importe canónico «1234.56», o null si no es un precio con céntimos. Acepta coma o punto. */
export function servicePriceDecimal(raw: unknown): string | null {
  if (raw && typeof raw === "object" && "toFixed" in raw && typeof raw.toFixed === "function") {
    return servicePriceDecimal(raw.toFixed(2));
  }
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw < 0 || raw > 1_000_000) return null;
    const cents = Math.round(raw * 100);
    if (Math.abs(raw * 100 - cents) > 1e-6) return null;
    return centsToDecimal(cents);
  }
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!trimmed) return null;
  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");
  let normalized = trimmed;
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed.replace(/,/g, "");
  } else if (lastComma >= 0) {
    normalized = trimmed.replace(",", ".");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, frac = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return centsToDecimal(cents);
}

export function parseServicePrice(raw: unknown): number | null {
  const decimal = servicePriceDecimal(raw);
  return decimal == null ? null : Number(decimal);
}

export function servicePriceAmount(raw: unknown): number {
  return parseServicePrice(raw) ?? 0;
}

/** Valor editable: «300» o «300,50». */
export function formatServicePriceInput(raw: unknown): string {
  const decimal = servicePriceDecimal(raw);
  if (!decimal) return "";
  const [whole, frac] = decimal.split(".");
  return frac === "00" ? whole : `${whole},${frac}`;
}

export function formatServicePrice(priceEur: unknown) {
  const amount = parseServicePrice(priceEur);
  if (amount == null) return "";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} € + IVA`;
}

export function currentStepIndex(steps: { done: boolean }[]) {
  const index = steps.findIndex((step) => !step.done);
  return index === -1 ? Math.max(steps.length - 1, 0) : index;
}
