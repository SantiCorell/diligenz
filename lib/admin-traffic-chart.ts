import { prisma } from "@/lib/prisma";

const TZ = "Europe/Madrid";

export type TrafficChartPoint = {
  key: string;
  users: number;
  anonymous: number;
};

export type TrafficChartHour = {
  day: string;
  hour: number;
  users: number;
};

export type TrafficChartData = {
  identifiedReady: boolean;
  today: string;
  rangeStart: string;
  months: TrafficChartPoint[];
  days: TrafficChartPoint[];
  hours: TrafficChartHour[];
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function asNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function madridParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function zonedStart(year: number, month: number, day: number): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utcGuess);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return new Date(utcGuess.getTime() - (asIfUtc - utcGuess.getTime()));
}

function lastMonthKeys(count: number, now: Date): string[] {
  const { year, month } = madridParts(now);
  const keys: string[] = [];
  let y = year;
  let m = month;
  for (let i = 0; i < count; i++) {
    keys.push(`${y}-${pad(m)}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return keys.reverse();
}

function formatUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function eachDay(start: string, end: string): string[] {
  const [year, month, day] = start.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));
  const out: string[] = [];
  for (let i = 0; i < 400; i++) {
    const key = formatUtc(cursor);
    out.push(key);
    if (key >= end) break;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function missingUserPageView(error: unknown): boolean {
  const parts = [error instanceof Error ? error.message : String(error)];
  if (typeof error === "object" && error && "meta" in error) {
    const meta = (error as { meta?: { message?: string } }).meta;
    if (meta?.message) parts.push(meta.message);
  }
  const message = parts.join(" ");
  return message.includes("UserPageView") || message.includes("42P01");
}

async function loadIdentified(rangeStart: Date): Promise<{
  ready: boolean;
  daily: Map<string, number>;
  monthly: Map<string, number>;
  hours: TrafficChartHour[];
}> {
  const empty = {
    ready: false,
    daily: new Map<string, number>(),
    monthly: new Map<string, number>(),
    hours: [] as TrafficChartHour[],
  };
  try {
    const [dailyRows, monthlyRows, hourlyRows] = await Promise.all([
      prisma.$queryRaw<{ day: string; users: number }[]>`
        SELECT to_char(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') AS day,
               COUNT(DISTINCT "userId")::int AS users
        FROM "UserPageView"
        WHERE "startedAt" >= ${rangeStart}
        GROUP BY 1
      `,
      prisma.$queryRaw<{ month: string; users: number }[]>`
        SELECT to_char(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Madrid', 'YYYY-MM') AS month,
               COUNT(DISTINCT "userId")::int AS users
        FROM "UserPageView"
        WHERE "startedAt" >= ${rangeStart}
        GROUP BY 1
      `,
      prisma.$queryRaw<{ day: string; hour: number; users: number }[]>`
        SELECT to_char(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') AS day,
               EXTRACT(HOUR FROM (("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Madrid'))::int AS hour,
               COUNT(DISTINCT "userId")::int AS users
        FROM "UserPageView"
        WHERE "startedAt" >= ${rangeStart}
        GROUP BY 1, 2
      `,
    ]);
    return {
      ready: true,
      daily: new Map(dailyRows.map((row) => [row.day, asNumber(row.users)])),
      monthly: new Map(monthlyRows.map((row) => [row.month, asNumber(row.users)])),
      hours: hourlyRows
        .map((row) => ({ day: row.day, hour: asNumber(row.hour), users: asNumber(row.users) }))
        .filter((row) => row.hour >= 0 && row.hour <= 23),
    };
  } catch (error) {
    if (missingUserPageView(error)) return empty;
    throw error;
  }
}

export async function loadTrafficChart(now = new Date()): Promise<TrafficChartData> {
  const monthKeys = lastMonthKeys(12, now);
  const { year, month, day } = madridParts(now);
  const today = `${year}-${pad(month)}-${pad(day)}`;
  const rangeStartKey = `${monthKeys[0]}-01`;
  const rangeStart = zonedStart(Number(monthKeys[0].slice(0, 4)), Number(monthKeys[0].slice(5, 7)), 1);
  const dayKeys = eachDay(rangeStartKey, today);

  const [anonymousRows, identified] = await Promise.all([
    prisma.aggregatePageMetric.groupBy({
      by: ["day"],
      where: { day: { gte: rangeStartKey, lte: today } },
      _sum: { count: true },
    }),
    loadIdentified(rangeStart),
  ]);

  const anonymousByDay = new Map(anonymousRows.map((row) => [row.day, row._sum.count ?? 0]));
  const anonymousByMonth = new Map<string, number>();
  for (const [dayKey, count] of anonymousByDay) {
    const monthKey = dayKey.slice(0, 7);
    if (!monthKey) continue;
    anonymousByMonth.set(monthKey, (anonymousByMonth.get(monthKey) ?? 0) + count);
  }

  return {
    identifiedReady: identified.ready,
    today,
    rangeStart: rangeStartKey,
    months: monthKeys.map((key) => ({
      key,
      users: identified.monthly.get(key) ?? 0,
      anonymous: anonymousByMonth.get(key) ?? 0,
    })),
    days: dayKeys.map((key) => ({
      key,
      users: identified.daily.get(key) ?? 0,
      anonymous: anonymousByDay.get(key) ?? 0,
    })),
    hours: identified.hours,
  };
}
