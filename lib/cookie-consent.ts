export const COOKIE_CONSENT_STORAGE_KEY = "diligenz_cookie_consent_v1";

export const CONSENT_EVENT = "diligenz-cookie-consent";
export const CONSENT_RESET_EVENT = "diligenz-cookie-consent-reset";

export type StoredCookieConsent = {
  v: 1;
  /** Siempre true tras cualquier elección válida */
  necessary: true;
  /** Mediciones / rendimiento (p. ej. Vercel Speed Insights) */
  analytics: boolean;
  savedAt: string;
};

export function readStoredConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredCookieConsent;
    if (p?.v !== 1 || p.necessary !== true) return null;
    return p;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): void {
  if (typeof window === "undefined") return;
  const payload: StoredCookieConsent = {
    v: 1,
    necessary: true,
    analytics,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: payload }));
}

export function clearConsentAndPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new Event(CONSENT_RESET_EVENT));
}

export function hasAnalyticsConsent(): boolean {
  return readStoredConsent()?.analytics === true;
}
