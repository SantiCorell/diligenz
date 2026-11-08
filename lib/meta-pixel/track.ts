"use client";

import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import { META_PIXEL_ID, isMetaPixelConfigured } from "./config";
import type {
  MetaEventName,
  MetaEventParams,
  MetaQueuedEvent,
  MetaStandardEvent,
  MetaTrackOptions,
} from "./types";

function consentOk(): boolean {
  return (
    typeof window !== "undefined" &&
    isMetaPixelConfigured() &&
    hasAnalyticsConsent()
  );
}

function canTrack(): boolean {
  return consentOk() && typeof window.fbq === "function";
}

type PendingFbqCall = {
  method: "track" | "trackCustom" | "trackSingle" | "trackSingleCustom";
  eventName: string;
  params?: MetaEventParams;
  eventID?: string;
};

/** Eventos con consentimiento que llegan antes de que fbq exista. */
const pendingFbq: PendingFbqCall[] = [];
let flushTimer: number | undefined;

function scheduleFlush(): void {
  if (typeof window === "undefined" || flushTimer) return;
  const started = Date.now();
  flushTimer = window.setInterval(() => {
    if (canTrack()) flushMetaPixelQueue();
    if (pendingFbq.length === 0 || Date.now() - started > 10000) {
      if (flushTimer) window.clearInterval(flushTimer);
      flushTimer = undefined;
    }
  }, 50);
}

function deliver(call: PendingFbqCall): void {
  if (!window.fbq) return;
  const { method, eventName, params, eventID } = call;
  const options = eventID ? { eventID } : undefined;
  if (params && options) {
    window.fbq(method, eventName, params, options);
  } else if (params) {
    window.fbq(method, eventName, params);
  } else if (options) {
    window.fbq(method, eventName, {}, options);
  } else {
    window.fbq(method, eventName);
  }
}

export function resetMetaPixelQueue(): void {
  pendingFbq.length = 0;
  if (flushTimer) {
    window.clearInterval(flushTimer);
    flushTimer = undefined;
  }
}

export function flushMetaPixelQueue(): void {
  if (!canTrack()) return;
  const batch = pendingFbq.splice(0, pendingFbq.length);
  for (const call of batch) deliver(call);
}

/** UUID v4 ligero (suficiente para eventID de Meta). */
export function createMetaEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `dz_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function enqueueForCapi(payload: MetaQueuedEvent): void {
  if (typeof window === "undefined") return;
  window.__metaCapiQueue = window.__metaCapiQueue ?? [];
  window.__metaCapiQueue.push(payload);
  // Futuro: fetch(META_CAPI_ENDPOINT, { method: "POST", body: JSON.stringify(payload) })
}

function pushToFbq(
  method: "track" | "trackCustom" | "trackSingle" | "trackSingleCustom",
  eventName: string,
  params?: MetaEventParams,
  eventID?: string
): void {
  if (!consentOk()) return;
  const call: PendingFbqCall = { method, eventName, params, eventID };
  if (typeof window.fbq !== "function") {
    pendingFbq.push(call);
    scheduleFlush();
    return;
  }
  deliver(call);
}

/**
 * Inicializa el Pixel una sola vez (tras consentimiento).
 * No dispara PageView: lo hace MetaPixelPageView / trackPageView.
 */
export function initMetaPixel(): void {
  if (!consentOk()) return;
  if (window.__metaPixelInitialized) return;
  if (typeof window.fbq !== "function") return;

  window.fbq("init", META_PIXEL_ID);
  window.__metaPixelInitialized = true;
}

/**
 * PageView con dedupe por ruta (pathname + search).
 * Útil en App Router: un PageView por navegación cliente.
 */
export function trackPageView(pathKey?: string): void {
  if (!consentOk()) return;
  const key =
    pathKey ??
    `${window.location.pathname}${window.location.search}`;
  if (window.__metaPixelPageViewKey === key) {
    flushMetaPixelQueue();
    return;
  }
  window.__metaPixelPageViewKey = key;

  const eventID = createMetaEventId();
  pushToFbq("track", "PageView", undefined, eventID);
  enqueueForCapi({
    eventName: "PageView",
    eventId: eventID,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: window.location.href,
  });
  flushMetaPixelQueue();
}

/**
 * Evento estándar de Meta (Lead, Contact, Purchase, etc.).
 */
export function trackMetaEvent(
  eventName: MetaStandardEvent | MetaEventName,
  params?: MetaEventParams,
  options?: MetaTrackOptions
): string | null {
  if (!consentOk()) return null;

  const eventID = options?.eventID ?? createMetaEventId();
  pushToFbq("track", eventName, params, eventID);

  if (options?.sendToCapi !== false) {
    enqueueForCapi({
      eventName,
      eventId: eventID,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: window.location.href,
      params,
    });
  }

  return eventID;
}

/**
 * Evento personalizado (Login, RequestCompanyInfo, …).
 */
export function trackMetaCustomEvent(
  eventName: string,
  params?: MetaEventParams,
  options?: MetaTrackOptions
): string | null {
  if (!consentOk()) return null;

  const eventID = options?.eventID ?? createMetaEventId();
  pushToFbq("trackCustom", eventName, params, eventID);

  if (options?.sendToCapi !== false) {
    enqueueForCapi({
      eventName,
      eventId: eventID,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: window.location.href,
      params,
    });
  }

  return eventID;
}

export { META_PIXEL_ID, isMetaPixelConfigured };
