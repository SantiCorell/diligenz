"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TrafficChartData } from "@/lib/admin-traffic-chart";

const USERS = "var(--brand-primary)";
const ANON = "#64748b";
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

type Grain = "month" | "week" | "day";

type Column = {
  id: string;
  label: string;
  title: string;
  users: number;
  anonymous: number | null;
};

type Tip = {
  key: string;
  title: string;
  users: number;
  anonymous: number | null;
  left: number;
  top: number;
  above: boolean;
  align: "center" | "end";
};

function formatInt(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function shiftDay(dayKey: string, delta: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + delta));
  return `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;
}

function weekStartMonday(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return shiftDay(dayKey, -((jsDay + 6) % 7));
}

function monthTitle(key: string): string {
  const month = Number(key.slice(5, 7));
  return `${MONTHS[month - 1] ?? key} ${key.slice(0, 4)}`;
}

function monthTick(key: string, index: number): string {
  const month = Number(key.slice(5, 7));
  const short = MONTHS_SHORT[month - 1] ?? key;
  return index === 0 || month === 1 ? `${short} ${key.slice(2, 4)}` : short;
}

function fullDay(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1] ?? ""} de ${year}`;
}

function shortDay(key: string): string {
  const month = Number(key.slice(5, 7));
  const day = Number(key.slice(8, 10));
  return `${day} ${MONTHS_SHORT[month - 1] ?? ""}`;
}

function weekTick(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[(jsDay + 6) % 7]} ${day}`;
}

function weekTitle(start: string): string {
  const end = shiftDay(start, 6);
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);
  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}–${endDay} ${MONTHS[startMonth - 1]} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDay} ${MONTHS_SHORT[startMonth - 1]} – ${endDay} ${MONTHS_SHORT[endMonth - 1]} ${startYear}`;
  }
  return `${startDay} ${MONTHS_SHORT[startMonth - 1]} ${startYear} – ${endDay} ${MONTHS_SHORT[endMonth - 1]} ${endYear}`;
}

function barHeight(value: number, max: number): string {
  if (value <= 0) return "0%";
  return `${Math.max(4, (value / max) * 100)}%`;
}

function tipPosition(anchor: HTMLElement): Pick<Tip, "left" | "top" | "above" | "align"> {
  const bars = [...anchor.querySelectorAll("span")].filter((node): node is HTMLElement => node instanceof HTMLElement);
  const visible = bars
    .map((node) => node.getBoundingClientRect())
    .filter((rect) => rect.height > 2);
  const barRect = visible.reduce<DOMRect | null>((best, rect) => (!best || rect.top < best.top ? rect : best), null);
  const anchorRect = anchor.getBoundingClientRect();
  const focus = barRect ?? anchorRect;
  const topEdge = focus.top;
  const align: Tip["align"] = focus.left + focus.width / 2 > window.innerWidth - 220 ? "end" : "center";
  const left = align === "end" ? focus.right + 4 : focus.left + focus.width / 2;
  const above = topEdge > 148;
  return { left, top: above ? topEdge - 8 : focus.bottom + 8, above, align };
}

function Legend({ color, label, note }: { color: string; label: string; note?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--brand-dark)]/70">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
      {label}
      {note && <span className="font-normal text-[var(--brand-dark)]/40">{note}</span>}
    </span>
  );
}

export function TrafficPeriodChart({ data }: { data: TrafficChartData }) {
  const [grain, setGrain] = useState<Grain>("month");
  const [monthFocus, setMonthFocus] = useState("all");
  const [week, setWeek] = useState(() => weekStartMonday(data.today));
  const [day, setDay] = useState(data.today);
  const [mounted, setMounted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const tipId = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const tipNodeRef = useRef<HTMLDivElement | null>(null);
  const lastTouchRef = useRef(0);

  const dayMap = useMemo(() => new Map(data.days.map((point) => [point.key, point])), [data.days]);
  const hourMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data.hours) map.set(`${row.day}:${row.hour}`, row.users);
    return map;
  }, [data.hours]);

  const hourly = grain === "day" && data.identifiedReady;
  const firstWeek = weekStartMonday(data.rangeStart);
  const canPrevWeek = week > firstWeek;
  const canNextWeek = shiftDay(week, 7) <= data.today;
  const canPrevDay = day > data.rangeStart;
  const canNextDay = day < data.today;

  const columns = useMemo<Column[]>(() => {
    if (grain === "month" && monthFocus === "all") {
      return data.months.map((month, index) => ({
        id: month.key,
        label: monthTick(month.key, index),
        title: monthTitle(month.key),
        users: month.users,
        anonymous: month.anonymous,
      }));
    }
    if (grain === "month") {
      return data.days
        .filter((point) => point.key.startsWith(`${monthFocus}-`) && point.key <= data.today)
        .map((point) => ({
          id: point.key,
          label: String(Number(point.key.slice(8, 10))),
          title: fullDay(point.key),
          users: point.users,
          anonymous: point.anonymous,
        }));
    }
    if (grain === "week") {
      return Array.from({ length: 7 }, (_, index) => {
        const key = shiftDay(week, index);
        const point = dayMap.get(key);
        return {
          id: key,
          label: weekTick(key),
          title: fullDay(key),
          users: point?.users ?? 0,
          anonymous: point?.anonymous ?? 0,
        };
      });
    }
    if (!data.identifiedReady) {
      const point = dayMap.get(day);
      return [
        {
          id: day,
          label: shortDay(day),
          title: fullDay(day),
          users: point?.users ?? 0,
          anonymous: point?.anonymous ?? 0,
        },
      ];
    }
    return Array.from({ length: 24 }, (_, hour) => ({
      id: `${day}-${hour}`,
      label: String(hour),
      title: `${fullDay(day)}, ${hour} h`,
      users: hourMap.get(`${day}:${hour}`) ?? 0,
      anonymous: null,
    }));
  }, [data.days, data.identifiedReady, data.months, data.today, day, dayMap, grain, hourMap, monthFocus, week]);

  const max = Math.max(1, ...columns.flatMap((column) => [column.users, column.anonymous ?? 0]));
  const showAnonymousSeries = columns.some((column) => column.anonymous != null);
  const anonymousInBars = columns.reduce((sum, column) => sum + (column.anonymous ?? 0), 0);
  const dayAnonymous = dayMap.get(day)?.anonymous ?? 0;
  const minWidth = columns.length >= 24 ? 760 : columns.length >= 16 ? 640 : undefined;
  const barMax = columns.length <= 7 ? "max-w-[28px]" : "max-w-[14px]";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setPinned(false);
    setTip(null);
  }, [grain, monthFocus, week, day]);

  useEffect(() => {
    if (!tip) return;
    function reposition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const pos = tipPosition(anchor);
      setTip((current) => (current ? { ...current, ...pos } : current));
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPinned(false);
      setTip(null);
    }
    function onPointerDown(event: PointerEvent) {
      if (!pinned) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-traffic-hit]")) return;
      setPinned(false);
      setTip(null);
    }
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [tip?.key, pinned]);

  useLayoutEffect(() => {
    const node = tipNodeRef.current;
    if (!node || !tip) return;
    const rect = node.getBoundingClientRect();
    const margin = 8;
    let delta = 0;
    if (rect.left < margin) delta = margin - rect.left;
    if (rect.right > window.innerWidth - margin) delta = window.innerWidth - margin - rect.right;
    if (rect.left + delta < margin && rect.right + delta > window.innerWidth - margin) delta = margin - rect.left;
    if (Math.abs(delta) < 1) return;
    setTip((current) => (current && current.key === tip.key ? { ...current, left: current.left + delta } : current));
  }, [tip]);

  function openTip(anchor: HTMLElement, column: Column, pin: boolean) {
    anchorRef.current = anchor;
    setPinned(pin);
    setTip({
      key: column.id,
      title: column.title,
      users: column.users,
      anonymous: column.anonymous,
      ...tipPosition(anchor),
    });
  }

  function closeTip() {
    setPinned(false);
    setTip(null);
  }

  const caption = hourly
    ? `Usuarios distintos por hora el ${fullDay(day)}`
    : grain === "week"
      ? `Usuarios distintos en la semana del ${weekTitle(week)}`
      : grain === "day"
        ? `Usuarios distintos el ${fullDay(day)}`
        : monthFocus === "all"
          ? "Usuarios distintos por mes, últimos 12 meses"
          : `Usuarios distintos en ${monthTitle(monthFocus)}`;

  return (
    <div className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-[#f3f2f5] p-1" role="tablist" aria-label="Periodo">
          {(
            [
              ["month", "Mes"],
              ["week", "Semana"],
              ["day", "Día"],
            ] as const
          ).map(([id, label]) => {
            const active = grain === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  if (id === "week") setWeek(weekStartMonday(day));
                  if (id === "day") {
                    const end = shiftDay(week, 6);
                    if (day < week || day > end) setDay(data.today >= week && data.today <= end ? data.today : week);
                  }
                  setGrain(id);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-[var(--brand-dark)] shadow-[0_1px_2px_rgba(16,16,20,0.08)]"
                    : "text-[var(--brand-dark)]/55 hover:text-[var(--brand-dark)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {grain === "month" ? (
          <select
            aria-label="Mes a mostrar"
            value={monthFocus}
            onChange={(event) => setMonthFocus(event.target.value)}
            className="max-w-full rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-sm text-[var(--brand-dark)]"
          >
            <option value="all">Últimos 12 meses</option>
            {[...data.months].reverse().map((month) => (
              <option key={month.key} value={month.key}>
                {monthTitle(month.key)}
              </option>
            ))}
          </select>
        ) : (
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              aria-label={grain === "week" ? "Semana anterior" : "Día anterior"}
              disabled={grain === "week" ? !canPrevWeek : !canPrevDay}
              onClick={() => (grain === "week" ? setWeek(shiftDay(week, -7)) : setDay(shiftDay(day, -1)))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[var(--brand-dark)] transition hover:bg-[#f6f5f8] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            {grain === "week" ? (
              <span className="min-w-[11rem] px-1 text-center text-sm font-medium text-[var(--brand-dark)]">
                {weekTitle(week)}
              </span>
            ) : (
              <input
                type="date"
                aria-label="Elegir día"
                value={day}
                min={data.rangeStart}
                max={data.today}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next >= data.rangeStart && next <= data.today) setDay(next);
                }}
                className="rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-sm text-[var(--brand-dark)]"
              />
            )}
            <button
              type="button"
              aria-label={grain === "week" ? "Semana siguiente" : "Día siguiente"}
              disabled={grain === "week" ? !canNextWeek : !canNextDay}
              onClick={() => (grain === "week" ? setWeek(shiftDay(week, 7)) : setDay(shiftDay(day, 1)))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[var(--brand-dark)] transition hover:bg-[#f6f5f8] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Legend color={USERS} label="Usuarios distintos" />
        {showAnonymousSeries && <Legend color={ANON} label="Visitas anónimas" note="no se suman" />}
        {hourly && <span className="text-xs text-[var(--brand-dark)]/45">Hora de Madrid</span>}
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex h-44 items-end gap-1.5" style={minWidth ? { minWidth } : undefined} role="group" aria-label={caption}>
          {columns.map((column) => {
            const described = tip?.key === column.id ? tipId : undefined;
            const summary =
              column.anonymous == null
                ? `${column.title}: ${formatInt(column.users)} usuarios distintos`
                : `${column.title}: ${formatInt(column.users)} usuarios distintos, ${formatInt(column.anonymous)} visitas anónimas`;
            return (
              <div key={column.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <button
                  type="button"
                  data-traffic-hit={column.id}
                  className="flex h-36 w-full cursor-pointer items-end justify-center gap-0.5 border-0 border-b border-black/[0.06] bg-transparent p-0"
                  aria-label={summary}
                  aria-describedby={described}
                  onMouseEnter={(event) => {
                    if (pinned || Date.now() - lastTouchRef.current < 700) return;
                    openTip(event.currentTarget, column, false);
                  }}
                  onMouseLeave={() => {
                    if (pinned || Date.now() - lastTouchRef.current < 700) return;
                    setTip(null);
                  }}
                  onFocus={(event) => {
                    if (pinned) return;
                    openTip(event.currentTarget, column, false);
                  }}
                  onBlur={() => {
                    if (!pinned) setTip(null);
                  }}
                  onPointerUp={(event) => {
                    if (event.pointerType !== "touch") return;
                    lastTouchRef.current = Date.now();
                    if (pinned && tip?.key === column.id) {
                      closeTip();
                      return;
                    }
                    openTip(event.currentTarget, column, true);
                  }}
                >
                  <span
                    className={`pointer-events-none block min-w-[4px] flex-1 ${barMax} rounded-t`}
                    style={{
                      height: barHeight(column.users, max),
                      background: USERS,
                    }}
                  />
                  {column.anonymous != null && (
                    <span
                      className={`pointer-events-none block min-w-[4px] flex-1 ${barMax} rounded-t`}
                      style={{
                        height: barHeight(column.anonymous, max),
                        background: ANON,
                      }}
                    />
                  )}
                </button>
                <span className="whitespace-nowrap text-[10px] font-medium text-[var(--brand-dark)]/45">{column.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--brand-dark)]/45">
        {hourly
          ? `Visitas anónimas de este día: ${formatInt(dayAnonymous)}. No tienen hora y no se suman a los usuarios.`
          : `Visitas anónimas en estas barras: ${formatInt(anonymousInBars)}. No se suman a los usuarios distintos.`}
      </p>
      {!data.identifiedReady && (
        <p className="mt-2 text-sm text-[var(--foreground)]/60">
          Falta aplicar la migración de vistas de usuario en esta base de datos. Los usuarios distintos se quedan a cero
          hasta entonces. Las visitas anónimas son el contador agregado y no se suman.
        </p>
      )}

      {mounted && tip
        ? createPortal(
            <div
              ref={tipNodeRef}
              id={tipId}
              role="tooltip"
              className={`pointer-events-none fixed z-50 w-max max-w-[220px] rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-[0_8px_20px_rgba(16,16,20,0.12)] ${tip.align === "end" ? "-translate-x-full" : "-translate-x-1/2"} ${tip.above ? "-translate-y-full" : ""}`}
              style={{ left: tip.left, top: tip.top }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-dark)]/45">{tip.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[var(--brand-dark)]/80">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: USERS }} aria-hidden />
                Usuarios distintos
              </p>
              <p className="mt-1 text-lg font-bold leading-none tracking-tight text-[var(--brand-dark)]">{formatInt(tip.users)}</p>
              {tip.anonymous != null && (
                <>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--brand-dark)]/80">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ANON }} aria-hidden />
                    Visitas anónimas
                  </p>
                  <p className="mt-1 text-lg font-bold leading-none tracking-tight text-[var(--brand-dark)]">
                    {formatInt(tip.anonymous)}
                  </p>
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
