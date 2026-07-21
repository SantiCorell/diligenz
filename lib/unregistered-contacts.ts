import type { ContactRequest, ValuationLead } from "@prisma/client";

export type UnregisteredContactGroup = {
  email: string;
  phone: string | null;
  displayName: string | null;
  valuations: ValuationLead[];
  contactRequests: ContactRequest[];
  latestActivity: Date;
  valuationCount: number;
  contactCount: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildUnregisteredContactGroups(
  registeredEmails: Iterable<string>,
  valuations: ValuationLead[],
  contacts: ContactRequest[]
): UnregisteredContactGroup[] {
  const registered = new Set(
    [...registeredEmails].map((e) => normalizeEmail(e)).filter(Boolean)
  );

  const byEmail = new Map<
    string,
    { valuations: ValuationLead[]; contacts: ContactRequest[] }
  >();

  for (const v of valuations) {
    const key = normalizeEmail(v.email);
    if (!key || registered.has(key)) continue;
    const bucket = byEmail.get(key) ?? { valuations: [], contacts: [] };
    bucket.valuations.push(v);
    byEmail.set(key, bucket);
  }

  for (const c of contacts) {
    const key = normalizeEmail(c.email);
    if (!key || registered.has(key)) continue;
    const bucket = byEmail.get(key) ?? { valuations: [], contacts: [] };
    bucket.contacts.push(c);
    byEmail.set(key, bucket);
  }

  const groups: UnregisteredContactGroup[] = [];

  for (const [email, bucket] of byEmail) {
    const dates = [
      ...bucket.valuations.map((v) => new Date(v.createdAt)),
      ...bucket.contacts.map((c) => new Date(c.createdAt)),
    ];
    const latestActivity = dates.reduce(
      (max, d) => (d.getTime() > max.getTime() ? d : max),
      dates[0] ?? new Date(0)
    );

    const phone =
      bucket.valuations.find((v) => v.phone?.trim())?.phone?.trim() ??
      bucket.contacts.find((c) => c.phone?.trim())?.phone?.trim() ??
      null;

    const displayName =
      bucket.contacts.find((c) => c.name?.trim())?.name?.trim() ??
      bucket.valuations.find((v) => v.companyName?.trim())?.companyName?.trim() ??
      null;

    groups.push({
      email,
      phone,
      displayName,
      valuations: bucket.valuations.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      contactRequests: bucket.contacts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      latestActivity,
      valuationCount: bucket.valuations.length,
      contactCount: bucket.contacts.length,
    });
  }

  return groups.sort(
    (a, b) => b.latestActivity.getTime() - a.latestActivity.getTime()
  );
}
