export const MADRID_TZ = "Europe/Madrid";

export type AgentCardData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  photoMime: string | null;
  bookingUrl: string | null;
  active: boolean;
  updatedAt: string;
};

export type MeetingPreview = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  status: "SCHEDULED" | "CANCELLED";
  agentName: string;
};

export function agentPhotoSrc(agent: {
  id: string;
  photoUrl: string | null;
  photoMime: string | null;
  updatedAt?: string | Date | null;
}): string | null {
  if (agent.photoMime) {
    const stamp = agent.updatedAt ? new Date(agent.updatedAt).toISOString() : "";
    return `/api/agents/${agent.id}/photo${stamp ? `?v=${encodeURIComponent(stamp)}` : ""}`;
  }
  return agent.photoUrl;
}

export function agentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "A";
}

export function formatMeetingWhen(iso: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("es-ES", {
    timeZone: MADRID_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("es-ES", {
    timeZone: MADRID_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time}`;
}

export function madridDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MADRID_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}
