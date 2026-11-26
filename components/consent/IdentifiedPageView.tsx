"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getStoredToken } from "@/lib/auth-client";
import { MAX_PAGE_DURATION_MS, MIN_PAGE_DURATION_MS } from "@/lib/page-view-limits";

/**
 * Vista identificada (ruta, usuario de la sesión y tiempo visible).
 * Mismo criterio que AggregatePageView: no espera al consentimiento de analítica,
 * porque el aviso agregado tampoco lo hace. Google Analytics sí espera.
 * Sin sesión el servidor no guarda nada. No toca dataLayer ni cookies de analítica.
 */

function normalizeClientPath(pathname: string): string | null {
  if (!pathname.startsWith("/") || pathname.includes("?") || pathname.includes("#")) {
    return null;
  }
  let path = pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.length > 180) return null;
  return path;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function sendDuration(id: string, durationMs: number) {
  if (durationMs < MIN_PAGE_DURATION_MS) return;
  const body = JSON.stringify({
    id,
    durationMs: Math.min(Math.round(durationMs), MAX_PAGE_DURATION_MS),
  });
  try {
    void fetch("/api/metrics/user-pageview/duration", {
      method: "POST",
      headers: authHeaders(),
      body,
      credentials: "include",
      keepalive: true,
      cache: "no-store",
    }).catch(() => {});
  } catch {
    navigator.sendBeacon?.(
      "/api/metrics/user-pageview/duration",
      new Blob([body], { type: "application/json" })
    );
  }
}

export default function IdentifiedPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const path = normalizeClientPath(pathname);
    if (!path) return;

    let cancelled = false;
    const state: { id: string | null; visibleMs: number; segmentStart: number | null } = {
      id: null,
      visibleMs: 0,
      segmentStart: document.visibilityState === "visible" ? performance.now() : null,
    };

    const closeSegment = () => {
      if (state.segmentStart == null) return;
      state.visibleMs += performance.now() - state.segmentStart;
      state.segmentStart = null;
    };

    const flush = () => {
      closeSegment();
      if (!state.id) return;
      sendDuration(state.id, state.visibleMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flush();
        return;
      }
      if (state.segmentStart == null) state.segmentStart = performance.now();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    void fetch("/api/metrics/user-pageview", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ path }),
      credentials: "include",
      keepalive: true,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const data = (await res.json().catch(() => null)) as { id?: unknown } | null;
        if (cancelled || !data || typeof data.id !== "string") return;
        state.id = data.id;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      flush();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  return null;
}
