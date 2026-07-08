import { ccaaLabel } from "@/lib/spain-ccaa";
import { publicListingName } from "@/lib/company-display-names";

export type OwnerCompanyCardInfo = {
  realName: string;
  webName: string;
  reference: string | null;
  location: string;
};

export function buildOwnerCompanyCardInfo(company: {
  name: string;
  reference: string | null;
  location: string;
  deals: { title: string }[];
}): OwnerCompanyCardInfo {
  const deal = company.deals[0];
  return {
    realName: company.name.trim() || "—",
    webName: publicListingName(deal?.title, company.name),
    reference: company.reference?.trim() || null,
    location: ccaaLabel(company.location),
  };
}

export function OwnerCompanyCardMeta({
  info,
  compact = false,
}: {
  info: OwnerCompanyCardInfo;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <dl className="mt-3 space-y-1.5 text-[11px] text-[var(--foreground)]/75 sm:text-xs">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-[var(--foreground)]/55">Nombre real</dt>
          <dd className="line-clamp-2 font-medium text-[var(--brand-dark)]">{info.realName}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-[var(--foreground)]/55">Nombre web</dt>
          <dd className="line-clamp-2">{info.webName}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>
            <span className="font-medium text-[var(--foreground)]/55">Ref. </span>
            {info.reference ?? "—"}
          </span>
          <span>
            <span className="font-medium text-[var(--foreground)]/55">Ciudad </span>
            {info.location}
          </span>
        </div>
      </dl>
    );
  }

  return (
    <dl className="mt-2 grid grid-cols-1 gap-2 text-sm text-[var(--foreground)]/85 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/55">
          Nombre real
        </dt>
        <dd className="mt-0.5 font-semibold text-[var(--brand-dark)]">{info.realName}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/55">
          Nombre web
        </dt>
        <dd className="mt-0.5">{info.webName}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/55">
          Referencia
        </dt>
        <dd className="mt-0.5">{info.reference ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/55">
          Ciudad
        </dt>
        <dd className="mt-0.5">{info.location}</dd>
      </div>
    </dl>
  );
}
