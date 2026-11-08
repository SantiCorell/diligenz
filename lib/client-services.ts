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

export function formatServicePrice(priceEur: number) {
  return `${new Intl.NumberFormat("es-ES").format(priceEur)} € + IVA`;
}

export function currentStepIndex(steps: { done: boolean }[]) {
  const index = steps.findIndex((step) => !step.done);
  return index === -1 ? Math.max(steps.length - 1, 0) : index;
}
