"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_EVENT,
  CONSENT_RESET_EVENT,
  readStoredConsent,
  writeConsent,
} from "@/lib/cookie-consent";

/** Un solo aviso, 60 s después, si todavía no hay elección. No se repite en esa carga. */
const REMINDER_AFTER_MS = 60_000;

/**
 * Barra inferior compacta (sin overlay). Consentimiento LSSI/RGPD vía dos opciones explícitas.
 * El recordatorio no tapa la página ni atrapa el foco. «Ahora no» no cuenta como aceptar.
 */
export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [reminder, setReminder] = useState(false);
  const dismissedReminder = useRef(false);

  useEffect(() => {
    let timer: number | null = null;
    const clearTimer = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    };
    const armReminder = () => {
      clearTimer();
      if (dismissedReminder.current || readStoredConsent()) return;
      timer = window.setTimeout(() => {
        timer = null;
        if (dismissedReminder.current || readStoredConsent()) return;
        setReminder(true);
      }, REMINDER_AFTER_MS);
    };

    /* eslint-disable react-hooks/set-state-in-effect -- hidratar tras mount (consentimiento y evitar mismatch SSR) */
    setMounted(true);
    const existing = readStoredConsent();
    setOpen(!existing);
    if (!existing) armReminder();
    /* eslint-enable react-hooks/set-state-in-effect */

    const onReset = () => {
      setOpen(true);
      setReminder(false);
      armReminder();
    };
    const onConsent = () => {
      setOpen(false);
      setReminder(false);
      clearTimer();
    };
    window.addEventListener(CONSENT_RESET_EVENT, onReset);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => {
      window.removeEventListener(CONSENT_RESET_EVENT, onReset);
      window.removeEventListener(CONSENT_EVENT, onConsent);
      clearTimer();
    };
  }, []);

  const acceptNecessaryOnly = () => {
    writeConsent(false);
    setOpen(false);
    setReminder(false);
  };

  const acceptAll = () => {
    writeConsent(true);
    setOpen(false);
    setReminder(false);
  };

  const dismissReminder = () => {
    dismissedReminder.current = true;
    setReminder(false);
  };

  if (!mounted) return null;

  if (!open && !reminder) return null;

  return (
    <>
      {open && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[500] border-t border-[var(--brand-primary)]/12 bg-white/92 backdrop-blur-md shadow-[0_-2px_16px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
          role="region"
          aria-label="Preferencias de cookies"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-2.5">
            <p className="min-w-0 text-[11px] leading-snug text-[var(--foreground)]/88 sm:text-xs sm:leading-tight md:truncate">
              <span className="hidden sm:inline">
                Cookies necesarias para el sitio; opcionalmente analítica de rendimiento.{" "}
                <Link
                  href="/politica-cookies"
                  className="whitespace-nowrap font-medium text-[var(--brand-primary)] underline decoration-[var(--brand-primary)]/40 underline-offset-2 hover:decoration-[var(--brand-primary)]"
                >
                  Política de cookies
                </Link>
                . Puedes cambiar esto en el pie de la web.
              </span>
              <span className="sm:hidden">
                Usamos cookies necesarias y, si aceptas, métricas.{" "}
                <Link href="/politica-cookies" className="font-medium text-[var(--brand-primary)] underline">
                  Más info
                </Link>
              </span>
            </p>
            <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
              <button
                type="button"
                onClick={acceptNecessaryOnly}
                className="rounded-lg border border-[var(--brand-primary)]/25 bg-white px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 sm:px-3 sm:text-xs"
              >
                Solo necesarias
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg bg-[var(--brand-primary)] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 sm:px-3 sm:text-xs"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}

      {reminder && open && (
        <div
          className="fixed bottom-28 right-3 z-[510] w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border border-[var(--brand-primary)]/15 bg-white p-3 shadow-md sm:bottom-20"
          role="region"
          aria-label="Recordatorio de cookies"
          aria-live="polite"
        >
          <p className="text-[11px] leading-snug text-[var(--foreground)]/88 sm:text-xs">
            Aún no has elegido. Google y Meta solo se activan si aceptas la analítica. Cerrar este
            aviso no es aceptar.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={acceptNecessaryOnly}
              className="rounded-lg border border-[var(--brand-primary)]/25 bg-white px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
            >
              Solo necesarias
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-lg bg-[var(--brand-primary)] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
            >
              Aceptar analítica
            </button>
            <button
              type="button"
              onClick={dismissReminder}
              className="px-1 py-1.5 text-[11px] font-medium text-[var(--foreground)]/70 underline hover:text-[var(--brand-primary)]"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}
    </>
  );
}
