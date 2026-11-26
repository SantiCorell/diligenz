import { Prisma, type ClientServiceStatus, type UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { entityTypeLabel } from "@/lib/company-display";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { ADMIN_ROLE_LABELS } from "@/lib/user-admin-ui";
import { sectorLabel } from "@/lib/valuation-sectors";

const TZ = "Europe/Madrid";
const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const SERVICE_STATUS_LABEL: Record<ClientServiceStatus, string> = {
  PROPOSAL: "Propuesta",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completado",
  DISCARDED: "Descartado",
};

const CHART_ROLES: UserRole[] = ["BUYER", "SELLER", "PROFESSIONAL"];

export type MonthPoint = {
  key: string;
  label: string;
};

export type CountRow = { label: string; count: number };

export type RankBlock = { rows: CountRow[]; more: number } | null;

export type AdminData = {
  summary: {
    users: number;
    newUsersThisMonth: number;
    buyers: number;
    sellers: number;
    professionals: number;
    admins: number;
    valuations: number;
    contacts: number;
    actions: number;
    serviceInquiries: number;
    services: number;
  };
  registrations: {
    months: (MonthPoint & { buyers: number; sellers: number; professionals: number })[];
  };
  pipeline: {
    months: (MonthPoint & { valuations: number; contacts: number; serviceInquiries: number })[];
    valuations: { total: number; thisMonth: number };
    contacts: { total: number; thisMonth: number };
    serviceInquiries: { total: number; thisMonth: number };
    services: { total: number; thisMonth: number; statuses: CountRow[] };
    actions: { total: number; thisMonth: number };
  };
  demographics: {
    roles: RankBlock;
    locations: RankBlock;
    sectors: RankBlock;
    companyTypes: RankBlock;
  };
  traffic: {
    identifiedReady: boolean;
    days: { key: string; label: string; users: number }[];
    distinctUsers30: number;
    anonymousViews30: number;
    identifiedViews30: number;
    anonymousPages: { path: string; views: number }[];
    identifiedPages: { path: string; views: number }[];
    timePages: { path: string; totalMs: number; avgMs: number; samples: number }[];
    people: {
      userId: string;
      name: string | null;
      email: string;
      role: string;
      views: number;
      durationMs: number;
      pages: { path: string; views: number }[];
    }[];
  };
};

function madridParts(date: Date, withDay: boolean) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: withDay ? get("day") : 1 };
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

function monthKey(date: Date): string {
  const { year, month } = madridParts(date, false);
  return `${year}-${String(month).padStart(2, "0")}`;
}

function lastMonthKeys(count: number, now: Date): string[] {
  const { year, month } = madridParts(now, false);
  const keys: string[] = [];
  let y = year;
  let m = month;
  for (let i = 0; i < count; i++) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return keys.reverse();
}

function labelMonth(key: string, index: number): string {
  const month = Number(key.slice(5, 7));
  const year = key.slice(2, 4);
  const short = MONTH_SHORT[month - 1] ?? key.slice(5);
  const showYear = index === 0 || month === 1;
  return showYear ? `${short} ${year}` : short;
}

function shiftDay(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  const yyyy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace(".", "");
}

function countIn<T extends string>(rows: { createdAt: Date; bucket: T }[], keys: string[], field: T) {
  const map = new Map(keys.map((key) => [key, 0]));
  for (const row of rows) {
    if (row.bucket !== field) continue;
    const key = monthKey(row.createdAt);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function rank(rows: CountRow[], limit = 6): RankBlock {
  const merged = new Map<string, number>();
  for (const row of rows) {
    const label = row.label.trim();
    if (!label || label === "—") continue;
    merged.set(label, (merged.get(label) ?? 0) + row.count);
  }
  const sorted = [...merged]
    .map(([label, count]) => ({ label, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  if (sorted.length === 0) return null;
  const head = sorted.slice(0, limit);
  const more = sorted.slice(limit).reduce((sum, row) => sum + row.count, 0);
  return { rows: head, more };
}

function asNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return 0;
}

function missingUserPageView(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("UserPageView") || message.includes("42P01");
}

export async function loadAdminData(now = new Date()): Promise<AdminData> {
  const monthKeys = lastMonthKeys(12, now);
  const rangeStart = zonedStart(Number(monthKeys[0].slice(0, 4)), Number(monthKeys[0].slice(5, 7)), 1);
  const { year, month, day } = madridParts(now, true);
  const monthStart = zonedStart(year, month, 1);
  const todayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dayKeys = Array.from({ length: 14 }, (_, index) => shiftDay(todayKey, index - 13));
  const since14 = zonedStart(
    Number(dayKeys[0].slice(0, 4)),
    Number(dayKeys[0].slice(5, 7)),
    Number(dayKeys[0].slice(8, 10))
  );
  const since30Key = shiftDay(todayKey, -29);
  const since30 = zonedStart(
    Number(since30Key.slice(0, 4)),
    Number(since30Key.slice(5, 7)),
    Number(since30Key.slice(8, 10))
  );
  const anonymousSinceDay = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    usersByRole,
    newUsersThisMonth,
    usersInRange,
    valuationTotal,
    contactTotal,
    serviceInquiryTotal,
    serviceTotal,
    actionTotal,
    valuationsInRange,
    contactsInRange,
    serviceInquiriesInRange,
    servicesInRange,
    actionsInRange,
    serviceStatuses,
    companies,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: true,
    }),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: monthStart } } }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: rangeStart },
        role: { in: CHART_ROLES },
      },
      select: { createdAt: true, role: true },
    }),
    prisma.valuationLead.count(),
    prisma.contactRequest.count({ where: { source: { not: "servicios" } } }),
    prisma.contactRequest.count({ where: { source: "servicios" } }),
    prisma.clientService.count(),
    prisma.userCompanyInterest.count({ where: { type: "REQUEST_INFO" } }),
    prisma.valuationLead.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.contactRequest.findMany({
      where: { createdAt: { gte: rangeStart }, source: { not: "servicios" } },
      select: { createdAt: true },
    }),
    prisma.contactRequest.findMany({
      where: { createdAt: { gte: rangeStart }, source: "servicios" },
      select: { createdAt: true },
    }),
    prisma.clientService.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.userCompanyInterest.findMany({
      where: { type: "REQUEST_INFO", createdAt: { gte: monthStart } },
      select: { createdAt: true },
    }),
    prisma.clientService.groupBy({ by: ["status"], _count: true }),
    prisma.company.findMany({
      where: { removedAt: null },
      select: { location: true, sector: true, companyType: true },
    }),
  ]);

  const roleCount = (role: UserRole) => usersByRole.find((row) => row.role === role)?._count ?? 0;

  const buyersByMonth = new Map(monthKeys.map((key) => [key, 0]));
  const sellersByMonth = new Map(monthKeys.map((key) => [key, 0]));
  const professionalsByMonth = new Map(monthKeys.map((key) => [key, 0]));
  for (const user of usersInRange) {
    const key = monthKey(user.createdAt);
    const target =
      user.role === "BUYER" ? buyersByMonth : user.role === "SELLER" ? sellersByMonth : professionalsByMonth;
    if (target.has(key)) target.set(key, (target.get(key) ?? 0) + 1);
  }

  const valuationByMonth = countIn(
    valuationsInRange.map((row) => ({ createdAt: row.createdAt, bucket: "valuations" as const })),
    monthKeys,
    "valuations"
  );
  const contactByMonth = countIn(
    contactsInRange.map((row) => ({ createdAt: row.createdAt, bucket: "contacts" as const })),
    monthKeys,
    "contacts"
  );
  const inquiryByMonth = countIn(
    serviceInquiriesInRange.map((row) => ({ createdAt: row.createdAt, bucket: "inquiries" as const })),
    monthKeys,
    "inquiries"
  );

  const thisMonth = (dates: { createdAt: Date }[]) =>
    dates.filter((row) => row.createdAt >= monthStart).length;

  const locationCounts = new Map<string, number>();
  const sectorCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  for (const company of companies) {
    const location = company.location?.trim();
    if (location) locationCounts.set(location, (locationCounts.get(location) ?? 0) + 1);
    const sector = company.sector?.trim();
    if (sector) sectorCounts.set(sector, (sectorCounts.get(sector) ?? 0) + 1);
    const companyType = company.companyType?.trim();
    if (companyType) typeCounts.set(companyType, (typeCounts.get(companyType) ?? 0) + 1);
  }

  const roleRows: CountRow[] = (["BUYER", "SELLER", "PROFESSIONAL", "ADMIN"] as const)
    .map((role) => ({ label: ADMIN_ROLE_LABELS[role], count: roleCount(role) }))
    .filter((row) => row.count > 0);

  const anonymousGrouped = await prisma.aggregatePageMetric.groupBy({
    by: ["path"],
    where: { day: { gte: anonymousSinceDay } },
    _sum: { count: true },
    orderBy: { _sum: { count: "desc" } },
    take: 8,
  });
  const anonymousTotal = await prisma.aggregatePageMetric.aggregate({
    where: { day: { gte: anonymousSinceDay } },
    _sum: { count: true },
  });

  const traffic = await loadTraffic({ dayKeys, since14, since30 });

  return {
    summary: {
      users: usersByRole.reduce((sum, row) => sum + row._count, 0),
      newUsersThisMonth,
      buyers: roleCount("BUYER"),
      sellers: roleCount("SELLER"),
      professionals: roleCount("PROFESSIONAL"),
      admins: roleCount("ADMIN"),
      valuations: valuationTotal,
      contacts: contactTotal,
      actions: actionTotal,
      serviceInquiries: serviceInquiryTotal,
      services: serviceTotal,
    },
    registrations: {
      months: monthKeys.map((key, index) => ({
        key,
        label: labelMonth(key, index),
        buyers: buyersByMonth.get(key) ?? 0,
        sellers: sellersByMonth.get(key) ?? 0,
        professionals: professionalsByMonth.get(key) ?? 0,
      })),
    },
    pipeline: {
      months: monthKeys.map((key, index) => ({
        key,
        label: labelMonth(key, index),
        valuations: valuationByMonth.get(key) ?? 0,
        contacts: contactByMonth.get(key) ?? 0,
        serviceInquiries: inquiryByMonth.get(key) ?? 0,
      })),
      valuations: { total: valuationTotal, thisMonth: thisMonth(valuationsInRange) },
      contacts: { total: contactTotal, thisMonth: thisMonth(contactsInRange) },
      serviceInquiries: { total: serviceInquiryTotal, thisMonth: thisMonth(serviceInquiriesInRange) },
      services: {
        total: serviceTotal,
        thisMonth: servicesInRange.filter((row) => row.createdAt >= monthStart).length,
        statuses: serviceStatuses
          .map((row) => ({ label: SERVICE_STATUS_LABEL[row.status], count: row._count }))
          .filter((row) => row.count > 0)
          .sort((a, b) => b.count - a.count),
      },
      actions: { total: actionTotal, thisMonth: actionsInRange.length },
    },
    demographics: {
      roles: rank(roleRows, 4),
      locations: rank(
        [...locationCounts].map(([value, count]) => ({ label: ccaaLabel(value), count }))
      ),
      sectors: rank([...sectorCounts].map(([value, count]) => ({ label: prettySector(value), count }))),
      companyTypes: rank(
        [...typeCounts].map(([value, count]) => ({ label: entityTypeLabel(value), count }))
      ),
    },
    traffic: {
      ...traffic,
      anonymousViews30: anonymousTotal._sum.count ?? 0,
      anonymousPages: anonymousGrouped
        .map((row) => ({ path: row.path, views: row._sum.count ?? 0 }))
        .filter((row) => row.views > 0),
    },
  };
}

function prettySector(value: string) {
  return sectorLabel(value).replace(" (histórico)", "");
}

async function loadTraffic({
  dayKeys,
  since14,
  since30,
}: {
  dayKeys: string[];
  since14: Date;
  since30: Date;
}): Promise<Omit<AdminData["traffic"], "anonymousViews30" | "anonymousPages">> {
  const emptyDays = dayKeys.map((key) => ({ key, label: dayLabel(key), users: 0 }));
  const empty = {
    identifiedReady: false,
    days: emptyDays,
    distinctUsers30: 0,
    identifiedViews30: 0,
    identifiedPages: [] as { path: string; views: number }[],
    timePages: [] as AdminData["traffic"]["timePages"],
    people: [] as AdminData["traffic"]["people"],
  };

  try {
    const [daily, distinct, views, pages, timePages, people] = await Promise.all([
      prisma.$queryRaw<{ day: string; users: number }[]>`
        SELECT to_char(("startedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') AS day,
               COUNT(DISTINCT "userId")::int AS users
        FROM "UserPageView"
        WHERE "startedAt" >= ${since14}
        GROUP BY 1
      `,
      prisma.$queryRaw<{ users: number }[]>`
        SELECT COUNT(DISTINCT "userId")::int AS users
        FROM "UserPageView"
        WHERE "startedAt" >= ${since30}
      `,
      prisma.$queryRaw<{ views: number }[]>`
        SELECT COUNT(*)::int AS views
        FROM "UserPageView"
        WHERE "startedAt" >= ${since30}
      `,
      prisma.$queryRaw<{ path: string; views: number }[]>`
        SELECT path, COUNT(*)::int AS views
        FROM "UserPageView"
        WHERE "startedAt" >= ${since30}
        GROUP BY path
        ORDER BY views DESC
        LIMIT 8
      `,
      prisma.$queryRaw<{ path: string; total_ms: number; avg_ms: number; samples: number }[]>`
        SELECT path,
               COALESCE(SUM("durationMs"), 0)::int AS total_ms,
               COALESCE(ROUND(AVG("durationMs")), 0)::int AS avg_ms,
               COUNT(*)::int AS samples
        FROM "UserPageView"
        WHERE "startedAt" >= ${since30} AND "durationMs" IS NOT NULL
        GROUP BY path
        ORDER BY total_ms DESC
        LIMIT 8
      `,
      prisma.$queryRaw<
        { userId: string; views: number; durationMs: number; email: string; name: string | null; role: string }[]
      >`
        SELECT v."userId" AS "userId",
               COUNT(*)::int AS views,
               COALESCE(SUM(v."durationMs"), 0)::int AS "durationMs",
               u.email AS email,
               u.name AS name,
               u.role::text AS role
        FROM "UserPageView" v
        JOIN "User" u ON u.id = v."userId"
        WHERE v."startedAt" >= ${since30}
        GROUP BY v."userId", u.email, u.name, u.role
        ORDER BY "durationMs" DESC, views DESC
        LIMIT 10
      `,
    ]);

    const byDay = new Map(daily.map((row) => [row.day, asNumber(row.users)]));
    const ids = people.map((person) => person.userId);
    let paths: { userId: string; path: string; views: number }[] = [];
    if (ids.length > 0) {
      paths = await prisma.$queryRaw<{ userId: string; path: string; views: number }[]>`
        SELECT "userId", path, COUNT(*)::int AS views
        FROM "UserPageView"
        WHERE "startedAt" >= ${since30} AND "userId" IN (${Prisma.join(ids)})
        GROUP BY "userId", path
        ORDER BY views DESC
      `;
    }

    const pagesByUser = new Map<string, { path: string; views: number }[]>();
    for (const row of paths) {
      const list = pagesByUser.get(row.userId) ?? [];
      if (list.length < 3) list.push({ path: row.path, views: asNumber(row.views) });
      pagesByUser.set(row.userId, list);
    }

    return {
      identifiedReady: true,
      days: dayKeys.map((key) => ({ key, label: dayLabel(key), users: byDay.get(key) ?? 0 })),
      distinctUsers30: asNumber(distinct[0]?.users),
      identifiedViews30: asNumber(views[0]?.views),
      identifiedPages: pages.map((row) => ({ path: row.path, views: asNumber(row.views) })),
      timePages: timePages.map((row) => ({
        path: row.path,
        totalMs: asNumber(row.total_ms),
        avgMs: asNumber(row.avg_ms),
        samples: asNumber(row.samples),
      })),
      people: people.map((person) => ({
        userId: person.userId,
        name: person.name,
        email: person.email,
        role: ADMIN_ROLE_LABELS[person.role as UserRole] ?? person.role,
        views: asNumber(person.views),
        durationMs: asNumber(person.durationMs),
        pages: pagesByUser.get(person.userId) ?? [],
      })),
    };
  } catch (error) {
    if (missingUserPageView(error)) return empty;
    throw error;
  }
}
