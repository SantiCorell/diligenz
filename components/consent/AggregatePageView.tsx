"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DEDUPE_MS = 800;
const lastSentAt = new Map<string, number>();
let attachedInitialTiming = false;

type NavBucket =
  | "navigate"
  | "reload"
  | "back_forward"
  | "prerender"
  | "spa"
  | "unknown";
type PerfBucket = "fast" | "ok" | "slow" | "unknown";

function readNav(): NavBucket {
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const type = entry?.type;
    if (
      type === "navigate" ||
      type === "reload" ||
      type === "back_forward" ||
      type === "prerender"
    ) {
      return type;
    }
  } catch {
    /* sin Performance API */
  }
  return "unknown";
}

/** Cubo de la carga del documento, no el tiempo que una persona pasa en la página. */
function readPerf(): PerfBucket {
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const ms = entry?.duration ?? 0;
    if (!ms || ms <= 0) return "unknown";
    if (ms < 1000) return "fast";
    if (ms < 3000) return "ok";
    return "slow";
  } catch {
    return "unknown";
  }
}

function normalizeClientPath(pathname: string): string | null {
  if (!pathname.startsWith("/") || pathname.includes("?") || pathname.includes("#")) {
    return null;
  }
  let path = pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.length > 180) return null;
  return path;
}

/**
 * Un aviso por vista. No espera al consentimiento y no toca dataLayer ni cookies.
 * En cambios de ruta internos solo cuenta la ruta (nav "spa"), sin duración de estancia.
 */
export default function AggregatePageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const path = normalizeClientPath(pathname);
    if (!path) return;

    let cancelled = false;

    const send = (includeLoad: boolean) => {
      if (cancelled) return;
      const now = Date.now();
      const prev = lastSentAt.get(path) ?? 0;
      if (now - prev < DEDUPE_MS) return;
      lastSentAt.set(path, now);

      const first = !attachedInitialTiming;
      attachedInitialTiming = true;

      const body = JSON.stringify({
        path,
        nav: first ? readNav() : "spa",
        perf: first && includeLoad ? readPerf() : "unknown",
      });

      void fetch("/api/metrics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "omit",
        keepalive: true,
        cache: "no-store",
      }).catch(() => {});
    };

    if (!attachedInitialTiming && document.readyState !== "complete") {
      const onLoad = () => send(true);
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        window.removeEventListener("load", onLoad);
        if (!attachedInitialTiming) {
          cancelled = false;
          send(false);
        } else {
          cancelled = true;
        }
      };
    }

    send(document.readyState === "complete");
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
