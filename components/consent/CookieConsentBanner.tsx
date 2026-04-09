"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_RESET_EVENT,
  readStoredConsent,
  writeConsent,
} from "@/lib/cookie-consent";

/**
 * Barra inferior compacta (sin overlay). Consentimiento LSSI/RGPD vía dos opciones explícitas.
 */
export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = readStoredConsent();
    setOpen(!existing);

    const onReset = () => setOpen(true);
    window.addEventListener(CONSENT_RESET_EVENT, onReset);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, onReset);
  }, []);

  const acceptNecessaryOnly = () => {
    writeConsent(false);
    setOpen(false);
  };

  const acceptAll = () => {
    writeConsent(true);
    setOpen(false);
  };

  if (!mounted || !open) return null;

  return (
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
  );
}
