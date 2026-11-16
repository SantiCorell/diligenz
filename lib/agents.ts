import { prisma } from "@/lib/prisma";
import type { AgentCardData, MeetingPreview } from "@/lib/agent-shared";

export class AgentInputError extends Error {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATA_URL_RE = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=\s]+)$/i;

export function parseBookingUrl(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") {
    throw new AgentInputError("El enlace de reserva no es válido.");
  }
  const value = raw.trim();
  if (!value) return null;
  if (value.length > 500) {
    throw new AgentInputError("El enlace de reserva es demasiado largo.");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AgentInputError("El enlace de reserva no es una URL válida.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new AgentInputError("El enlace de reserva tiene que empezar por https://.");
  }
  return url.toString();
}

export function parsePhotoDataUrl(
  raw: unknown
): { mime: string; bytes: Uint8Array<ArrayBuffer> } | null {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") {
    throw new AgentInputError("La foto no es válida.");
  }
  const match = raw.match(DATA_URL_RE);
  if (!match) {
    throw new AgentInputError("La foto debe ser JPG, PNG o WEBP.");
  }
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (bytes.length < 32 || bytes.length > 1_500_000) {
    throw new AgentInputError("La foto debe pesar entre unos bytes y 1,5 MB.");
  }
  const mime = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const copy = new ArrayBuffer(bytes.byteLength);
  const view = new Uint8Array(copy);
  view.set(bytes);
  return { mime, bytes: view };
}

export function parseAgentName(raw: unknown, required: boolean): string | undefined {
  if (raw == null || raw === "") {
    if (required) throw new AgentInputError("El nombre del agente es obligatorio.");
    return undefined;
  }
  if (typeof raw !== "string" || !raw.trim()) {
    throw new AgentInputError("El nombre del agente no es válido.");
  }
  const name = raw.trim().slice(0, 120);
  if (name.length < 2) throw new AgentInputError("El nombre del agente es demasiado corto.");
  return name;
}

export function parseAgentEmail(raw: unknown, required: boolean): string | undefined {
  if (raw == null || raw === "") {
    if (required) throw new AgentInputError("El email del agente es obligatorio.");
    return undefined;
  }
  if (typeof raw !== "string") throw new AgentInputError("El email del agente no es válido.");
  const email = raw.trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(email)) throw new AgentInputError("El email del agente no es válido.");
  return email;
}

export function parseAgentPhone(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") throw new AgentInputError("El teléfono no es válido.");
  const phone = raw.trim().slice(0, 40);
  return phone || null;
}

export async function getAgentCardById(id: string | null | undefined): Promise<AgentCardData | null> {
  if (!id) return null;
  const row = await prisma.agent.findUnique({
    where: { id },
    select: agentCardSelect,
  });
  if (!row?.active) return null;
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

export async function getDefaultAgentCard(): Promise<AgentCardData | null> {
  const id = await getDefaultAgentId();
  if (!id) return null;
  const row = await prisma.agent.findUnique({
    where: { id },
    select: agentCardSelect,
  });
  if (!row?.active) return null;
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

const SEEDED_DEFAULT_AGENT_ID = "agent_jose_canizares";

function isJoseCanizaresName(name: string): boolean {
  const folded = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return folded.includes("jose") && folded.includes("canizares");
}

export async function getDefaultAgentId(): Promise<string | null> {
  const preferred = await prisma.agent.findFirst({
    where: { isDefault: true, active: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (preferred) return preferred.id;

  const active = await prisma.agent.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  const jose =
    active.find((agent) => agent.id === SEEDED_DEFAULT_AGENT_ID) ??
    active.find((agent) => isJoseCanizaresName(agent.name));
  if (jose) return jose.id;
  return active[0]?.id ?? null;
}

/** Mismo agente por defecto para el marketplace y para servicios. */
export async function defaultAgentIds(): Promise<{
  assignedAgentId: string | null;
  servicesAgentId: string | null;
}> {
  try {
    const id = await getDefaultAgentId();
    return { assignedAgentId: id, servicesAgentId: id };
  } catch (error) {
    console.error(
      "[agents] agente por defecto:",
      error instanceof Error ? error.message : "failed"
    );
    return { assignedAgentId: null, servicesAgentId: null };
  }
}

/** No pisa un gestor que ya esté guardado. */
export async function assignDefaultServicesAgentIfEmpty(userId: string): Promise<void> {
  const agentId = await getDefaultAgentId();
  if (!agentId) return;
  await prisma.user.updateMany({
    where: { id: userId, servicesAgentId: null },
    data: { servicesAgentId: agentId },
  });
}

const agentCardSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  photoUrl: true,
  photoMime: true,
  bookingUrl: true,
  active: true,
  updatedAt: true,
} as const;

export async function getDashboardAgent(userId: string): Promise<{
  agent: AgentCardData | null;
  nextMeeting: MeetingPreview | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      assignedAgent: { select: agentCardSelect },
      meetings: {
        where: { status: "SCHEDULED" },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          title: true,
          startsAt: true,
          endsAt: true,
          status: true,
          agent: { select: { name: true } },
        },
      },
    },
  });

  if (!user) return { agent: null, nextMeeting: null };

  const now = Date.now() - 60 * 60 * 1000;
  const next = [...user.meetings]
    .filter((meeting) => !meeting.startsAt || meeting.startsAt.getTime() >= now)
    .sort((a, b) => {
      if (!a.startsAt && !b.startsAt) return 0;
      if (!a.startsAt) return 1;
      if (!b.startsAt) return -1;
      return a.startsAt.getTime() - b.startsAt.getTime();
    })[0];

  return {
    agent: user.assignedAgent
      ? {
          ...user.assignedAgent,
          updatedAt: user.assignedAgent.updatedAt.toISOString(),
        }
      : null,
    nextMeeting: next
      ? {
          id: next.id,
          title: next.title,
          startsAt: next.startsAt?.toISOString() ?? null,
          endsAt: next.endsAt?.toISOString() ?? null,
          status: next.status,
          agentName: next.agent.name,
        }
      : null,
  };
}

type ScheduleTimes = {
  startsAt: Date | null;
  endsAt: Date | null;
  eventUri: string | null;
};

function walkSchedule(value: unknown, acc: ScheduleTimes, depth: number) {
  if (depth > 6 || value == null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) walkSchedule(item, acc, depth + 1);
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (typeof nested === "string") {
      if ((key === "start_time" || key === "startTime") && !acc.startsAt) {
        const parsed = new Date(nested);
        if (!Number.isNaN(parsed.getTime())) acc.startsAt = parsed;
      }
      if ((key === "end_time" || key === "endTime") && !acc.endsAt) {
        const parsed = new Date(nested);
        if (!Number.isNaN(parsed.getTime())) acc.endsAt = parsed;
      }
      if (
        (key === "uri" || key === "event") &&
        nested.includes("scheduled_events") &&
        !nested.includes("/invitees/") &&
        !acc.eventUri
      ) {
        acc.eventUri = nested.slice(0, 300);
      }
    } else {
      walkSchedule(nested, acc, depth + 1);
    }
  }
}

export function extractScheduleTimes(payload: unknown): ScheduleTimes {
  const acc: ScheduleTimes = { startsAt: null, endsAt: null, eventUri: null };
  walkSchedule(payload, acc, 0);
  return acc;
}

export function assertMeetingWindow(startsAt: Date, endsAt: Date) {
  const min = Date.now() - 24 * 60 * 60 * 1000;
  const max = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new AgentInputError("La fecha de la reunión no es válida.");
  }
  if (startsAt.getTime() < min || startsAt.getTime() > max) {
    throw new AgentInputError("La fecha de la reunión queda fuera del calendario.");
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new AgentInputError("La hora de fin tiene que ser posterior al inicio.");
  }
}
