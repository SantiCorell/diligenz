import type { ReactNode } from "react";
import Link from "next/link";

const BUYER = "#9146ff";
const SELLER = "#4d7c0f";
const PROFESSIONAL = "#d97706";
const VALUATION = "#9146ff";
const CONTACT = "#0284c7";
const SERVICE = "#4d7c0f";

export function formatInt(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "0 s";
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return seconds ? `${minutes} min ${seconds} s` : `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  return remain ? `${hours} h ${remain} min` : `${hours} h`;
}

export function KpiCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  href?: string;
}) {
  const content = (
    <div className="flex h-full flex-col rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <p className="text-sm font-medium text-[var(--brand-dark)]/55">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--brand-dark)]">{formatInt(value)}</p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--brand-dark)]/45">{subtitle}</p>
    </div>
  );
  if (!href) return content;
  return (
    <Link href={href} className="block h-full no-underline">
      {content}
    </Link>
  );
}

export function Section({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">{kicker}</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--brand-dark)]">{title}</h2>
      {intro && <p className="mt-1 max-w-3xl text-sm text-[var(--foreground)]/70">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Series = { label: string; color: string };

export function GroupedBars({
  caption,
  series,
  rows,
  empty,
}: {
  caption: string;
  series: Series[];
  rows: { id: string; label: string; values: number[] }[];
  empty: string;
}) {
  const max = Math.max(1, ...rows.flatMap((row) => row.values));
  const total = series.map((item, index) => ({
    ...item,
    total: rows.reduce((sum, row) => sum + (row.values[index] ?? 0), 0),
  }));
  const hasData = total.some((item) => item.total > 0);

  return (
    <div className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {series.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--brand-dark)]/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} aria-hidden />
            {item.label}
          </span>
        ))}
      </div>
      {hasData ? (
        <div className="mt-4 overflow-x-auto">
          <div
            className="flex h-44 min-w-[720px] items-end gap-2"
            role="img"
            aria-label={`${caption}. ${total.map((item) => `${item.label}: ${formatInt(item.total)}`).join(". ")}`}
          >
            {rows.map((row) => (
              <div key={row.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end justify-center gap-0.5">
                  {row.values.map((value, index) => (
                    <div
                      key={series[index]?.label ?? index}
                      className="w-full max-w-[12px] rounded-t"
                      style={{
                        height: value > 0 ? `${Math.max(4, (value / max) * 100)}%` : "0%",
                        background: series[index]?.color,
                      }}
                      title={`${row.label} · ${series[index]?.label ?? ""}: ${formatInt(value)}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-[var(--brand-dark)]/45">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--foreground)]/60">{empty}</p>
      )}
      {hasData && (
        <p className="mt-3 text-xs text-[var(--brand-dark)]/45">
          {total.map((item) => `${item.label} ${formatInt(item.total)}`).join(" · ")} en el periodo
        </p>
      )}
    </div>
  );
}

export function DailyUsers({ days }: { days: { label: string; users: number }[] }) {
  const max = Math.max(1, ...days.map((day) => day.users));
  const hasData = days.some((day) => day.users > 0);
  if (!hasData) {
    return <p className="text-sm text-[var(--foreground)]/60">Todavía no hay usuarios identificados en estos días.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <div
        className="flex h-36 min-w-[640px] items-end gap-2"
        role="img"
        aria-label={`Usuarios distintos por día. ${days.map((day) => `${day.label}: ${day.users}`).join(", ")}`}
      >
        {days.map((day) => (
          <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-[var(--brand-dark)]/70">{day.users > 0 ? day.users : ""}</span>
            <div className="flex h-24 w-full items-end justify-center">
              <div
                className="w-full max-w-[22px] rounded-t bg-[var(--brand-primary)]"
                style={{ height: day.users > 0 ? `${Math.max(6, (day.users / max) * 100)}%` : "0%" }}
              />
            </div>
            <span className="text-[10px] text-[var(--brand-dark)]/45">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BreakdownCard({
  title,
  hint,
  rows,
  more,
}: {
  title: string;
  hint?: string;
  rows: { label: string; count: number }[];
  more: number;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <h3 className="text-[15px] font-semibold text-[var(--brand-dark)]">{title}</h3>
      {hint && <p className="mt-1 text-xs text-[var(--brand-dark)]/45">{hint}</p>}
      <ul className="mt-3 space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-[var(--brand-dark)]/80">{row.label}</span>
              <span className="font-medium text-[var(--brand-dark)]/70">{formatInt(row.count)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f3f2f5]">
              <div
                className="h-full rounded-full bg-[var(--brand-primary)]"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {more > 0 && <p className="mt-3 text-xs text-[var(--brand-dark)]/45">y {formatInt(more)} en el resto</p>}
    </section>
  );
}

export function PageList({
  title,
  hint,
  rows,
  empty,
}: {
  title: string;
  hint: string;
  rows: { path: string; views: number }[];
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.views));
  return (
    <section className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <h3 className="text-[15px] font-semibold text-[var(--brand-dark)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--brand-dark)]/45">{hint}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--foreground)]/60">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.path}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-mono text-xs text-[var(--brand-dark)]/80" title={row.path}>
                  {row.path}
                </span>
                <span className="shrink-0 text-sm font-medium text-[var(--brand-dark)]/70">{formatInt(row.views)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f3f2f5]">
                <div
                  className="h-full rounded-full bg-[var(--brand-primary)]"
                  style={{ width: `${(row.views / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const registrationSeries: Series[] = [
  { label: "Compradores", color: BUYER },
  { label: "Vendedores", color: SELLER },
  { label: "Profesionales", color: PROFESSIONAL },
];

export const pipelineSeries: Series[] = [
  { label: "Valoraciones", color: VALUATION },
  { label: "Contacto", color: CONTACT },
  { label: "Consultas de servicios", color: SERVICE },
];
