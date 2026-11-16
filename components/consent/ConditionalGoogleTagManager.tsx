"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  CONSENT_RESET_EVENT,
  hasAnalyticsConsent,
} from "@/lib/cookie-consent";

const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-W3SZ2DJH";

const BOOT_ID = "google-tag-manager";

/** Etiqueta del contenedor, al inicio de <head>, solo con consentimiento de analítica. */
function installGoogleTag(gtmId: string) {
  if (document.getElementById(BOOT_ID)) return;

  const boot = document.createElement("script");
  boot.id = BOOT_ID;
  boot.text = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;

  const head = document.head;
  if (head.firstChild) head.insertBefore(boot, head.firstChild);
  else head.appendChild(boot);
}

export default function ConditionalGoogleTagManager() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasAnalyticsConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener(CONSENT_RESET_EVENT, sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener(CONSENT_RESET_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !GTM_ID) return;
    installGoogleTag(GTM_ID);
  }, [enabled]);

  if (!enabled || !GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
