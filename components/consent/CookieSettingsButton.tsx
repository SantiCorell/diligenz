"use client";

import { clearConsentAndPrompt } from "@/lib/cookie-consent";

/** Reabre la barra de cookies. No acepta ni rechaza por sí solo. */
export default function CookieSettingsButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <button type="button" onClick={() => clearConsentAndPrompt()} className={className}>
      Configuración de cookies
    </button>
  );
}
