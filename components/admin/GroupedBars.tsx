"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function formatInt(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

type Series = { label: string; color: string };

type BarTip = {
  key: string;
  month: string;
  role: string;
  count: number;
  color: string;
  left: number;
  top: number;
  above: boolean;
};

function tipPosition(anchor: HTMLElement): Pick<BarTip, "left" | "top" | "above"> {
  const bar = anchor.querySelector<HTMLElement>("[data-bar]");
  const barRect = bar?.getBoundingClientRect();
  const rect = barRect && barRect.height > 0 ? barRect : anchor.getBoundingClientRect();
  const above = rect.top > 88;
  return { left: rect.left + rect.width / 2, top: above ? rect.top - 8 : rect.bottom + 8, above };
}

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
  const tipId = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const tipNodeRef = useRef<HTMLDivElement | null>(null);
  const lastTouchRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [tip, setTip] = useState<BarTip | null>(null);

  useEffect(() => setMounted(true), []);

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
      if (target?.closest("[data-bar-hit]")) return;
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
    const anchor = anchorRef.current;
    if (!node || !tip || !anchor) return;
    const bar = anchor.querySelector<HTMLElement>("[data-bar]");
    const barRect = bar?.getBoundingClientRect();
    const anchorRect = barRect && barRect.height > 0 ? barRect : anchor.getBoundingClientRect();
    const tipRect = node.getBoundingClientRect();
    const margin = 8;
    const half = tipRect.width / 2;
    let left = anchorRect.left + anchorRect.width / 2;
    left = Math.min(Math.max(left, margin + half), window.innerWidth - margin - half);
    if (Math.abs(left - tip.left) < 1) return;
    setTip((current) => (current && current.key === tip.key ? { ...current, left } : current));
  }, [tip]);

  function openTip(anchor: HTMLElement, next: Omit<BarTip, "left" | "top" | "above">, pin: boolean) {
    anchorRef.current = anchor;
    setPinned(pin);
    setTip({ ...next, ...tipPosition(anchor) });
  }

  function closeTip() {
    setPinned(false);
    setTip(null);
  }

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
            role="group"
            aria-label={`${caption}. ${total.map((item) => `${item.label}: ${formatInt(item.total)}`).join(". ")}`}
          >
            {rows.map((row) => (
              <div key={row.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end justify-center gap-0.5">
                  {row.values.map((value, index) => {
                    const item = series[index];
                    const role = item?.label ?? "";
                    const color = item?.color;
                    const key = `${row.id}:${role || index}`;
                    const barStyle = {
                      height: value > 0 ? `${Math.max(4, (value / max) * 100)}%` : "0%",
                      background: color,
                    };
                    if (value <= 0 || !item) {
                      return <div key={key} className="w-full max-w-[12px] rounded-t" style={barStyle} />;
                    }
                    const payload = { key, month: row.label, role, count: value, color: item.color };
                    return (
                      <button
                        key={key}
                        type="button"
                        data-bar-hit={key}
                        className="flex h-full w-full max-w-[12px] cursor-pointer items-end rounded-none border-0 bg-transparent p-0"
                        aria-label={`${row.label}, ${role}: ${formatInt(value)}`}
                        aria-describedby={tip?.key === key ? tipId : undefined}
                        onMouseEnter={(event) => {
                          if (pinned || Date.now() - lastTouchRef.current < 700) return;
                          openTip(event.currentTarget, payload, false);
                        }}
                        onMouseLeave={() => {
                          if (pinned || Date.now() - lastTouchRef.current < 700) return;
                          setTip(null);
                        }}
                        onFocus={(event) => {
                          if (pinned) return;
                          openTip(event.currentTarget, payload, false);
                        }}
                        onBlur={(event) => {
                          if (pinned) return;
                          const next = event.relatedTarget;
                          if (next instanceof Element && next.closest("[data-bar-hit]")) return;
                          setTip(null);
                        }}
                        onPointerUp={(event) => {
                          if (event.pointerType !== "touch") return;
                          lastTouchRef.current = Date.now();
                          if (pinned && tip?.key === key) {
                            closeTip();
                            return;
                          }
                          openTip(event.currentTarget, payload, true);
                        }}
                      >
                        <span data-bar className="pointer-events-none block w-full rounded-t" style={barStyle} />
                      </button>
                    );
                  })}
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
      {mounted && tip
        ? createPortal(
            <div
              ref={tipNodeRef}
              id={tipId}
              role="tooltip"
              className={`pointer-events-none fixed z-50 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-[0_8px_20px_rgba(16,16,20,0.12)] ${tip.above ? "-translate-y-full" : ""}`}
              style={{ left: tip.left, top: tip.top }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-dark)]/45">{tip.month}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[var(--brand-dark)]/80">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tip.color }} aria-hidden />
                {tip.role}
              </p>
              <p className="mt-1 text-lg font-bold leading-none tracking-tight text-[var(--brand-dark)]">{formatInt(tip.count)}</p>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
