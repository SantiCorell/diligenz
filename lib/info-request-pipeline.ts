import type { RequestStatus } from "@prisma/client";

/** Embudo visible para comprador y gestor. PENDING y MANAGED quedan como legado. */
export const PIPELINE_STATUSES = [
  "PENDING_NDA",
  "IN_REVIEW",
  "TEASER",
  "CONVERSATIONS",
  "CLOSED",
  "REJECTED",
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export const PIPELINE_STATUS_LABELS: Record<PipelineStatus, string> = {
  PENDING_NDA: "Pendiente NDA",
  IN_REVIEW: "En revisión",
  TEASER: "Teaser",
  CONVERSATIONS: "Conversaciones",
  CLOSED: "Cerrada",
  REJECTED: "Rechazada",
};

const LEGACY_LABELS: Record<string, string> = {
  PENDING: "Pendiente NDA",
  MANAGED: "Teaser",
};

export function requestStatusLabel(status: string | null | undefined): string {
  if (!status) return PIPELINE_STATUS_LABELS.PENDING_NDA;
  if (status in PIPELINE_STATUS_LABELS) {
    return PIPELINE_STATUS_LABELS[status as PipelineStatus];
  }
  return LEGACY_LABELS[status] ?? status;
}

export function normalizeRequestStatus(status: string | null | undefined): PipelineStatus {
  switch (status) {
    case "MANAGED":
    case "TEASER":
      return "TEASER";
    case "IN_REVIEW":
      return "IN_REVIEW";
    case "CONVERSATIONS":
      return "CONVERSATIONS";
    case "CLOSED":
      return "CLOSED";
    case "REJECTED":
      return "REJECTED";
    case "PENDING_NDA":
    case "PENDING":
    default:
      return "PENDING_NDA";
  }
}

/** Cuentan para el límite de solicitudes activas. */
export const ACTIVE_REQUEST_STATUSES: RequestStatus[] = [
  "PENDING",
  "PENDING_NDA",
  "IN_REVIEW",
  "MANAGED",
  "TEASER",
  "CONVERSATIONS",
];

export function isActiveRequestStatus(status: string | null | undefined): boolean {
  return ACTIVE_REQUEST_STATUSES.includes((status ?? "PENDING") as RequestStatus);
}

/** El comprador puede abrir el teaser. */
export const TEASER_ACCESS_STATUSES: RequestStatus[] = [
  "MANAGED",
  "TEASER",
  "CONVERSATIONS",
  "CLOSED",
];

export function buyerHasTeaserAccess(status: string | null | undefined): boolean {
  return TEASER_ACCESS_STATUSES.includes((status ?? "") as RequestStatus);
}

export function initialRequestStatus(ndaSigned: boolean): PipelineStatus {
  return ndaSigned ? "IN_REVIEW" : "PENDING_NDA";
}

export type BuyerMoment = {
  title: string;
  body: string;
};

/** Texto exacto de lo que el comprador está viendo en ese estado. */
export function buyerMomentCopy(status: string | null | undefined): BuyerMoment {
  switch (normalizeRequestStatus(status)) {
    case "PENDING_NDA":
      return {
        title: "Completa tu verificación para avanzar",
        body: "Tu gestor no puede revisar la solicitud hasta que firmes el mandato de compra y subas tu documentación.",
      };
    case "IN_REVIEW":
      return {
        title: "Tu gestor la está revisando",
        body: "Respuesta estimada: 2-3 días laborables.",
      };
    case "TEASER":
      return {
        title: "Ya tienes el teaser — ¿quieres avanzar con esta operación?",
        body: "Si te interesa, pasamos a conversaciones y te damos acceso al dossier completo y el contacto del vendedor. Si no, puedes descartarla y seguimos explorando.",
      };
    case "CONVERSATIONS":
      return {
        title: "Vamos a contactarte pronto",
        body: "Has decidido avanzar. El equipo de Diligenz se pondrá en contacto contigo para continuar la operación.",
      };
    case "CLOSED":
      return {
        title: "Operación cerrada",
        body: "Esta solicitud ha llegado a su fin. Puedes seguir explorando otras empresas.",
      };
    case "REJECTED":
      return {
        title: "Solicitud descartada",
        body: "Esta empresa ha quedado fuera del proceso. Puedes solicitar información de otra cuando quieras.",
      };
    default:
      return {
        title: "Solicitud en curso",
        body: "Tu gestor te mantendrá al tanto del siguiente paso.",
      };
  }
}

export function ageLabel(from: Date, now = new Date()): string {
  const ms = Math.max(0, now.getTime() - from.getTime());
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "ahora";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 día" : `${days} días`;
}
