"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CONSENT_EVENT,
  CONSENT_RESET_EVENT,
  hasAnalyticsConsent,
} from "@/lib/cookie-consent";
import {
  META_PIXEL_ID,
  initMetaPixel,
  isMetaPixelConfigured,
  trackPageView,
} from "@/lib/meta-pixel";

function routeKey(pathname: string, searchParams: ReturnType<typeof useSearchParams>) {
  const q = searchParams?.toString();
  return `${pathname}${q ? `?${q}` : ""}`;
}

/**
 * Carga el Meta Pixel una sola vez (tras consentimiento) y
 * registra PageView en cada cambio de ruta del App Router.
 */
export default function ConditionalMetaPixel() {
  const [enabled, setEnabled] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sync = () => {
      const ok = hasAnalyticsConsent();
      setEnabled(ok);
      if (!ok && typeof window !== "undefined") {
        window.__metaPixelInitialized = false;
        window.__metaPixelPageViewKey = undefined;
        setScriptReady(false);
      }
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener(CONSENT_RESET_EVENT, sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener(CONSENT_RESET_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !scriptReady) return;
    initMetaPixel();
    trackPageView(routeKey(pathname, searchParams));
  }, [enabled, scriptReady, pathname, searchParams]);

  if (!enabled || !isMetaPixelConfigured()) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
window.__metaPixelInitialized = true;
`,
        }}
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel 1x1 de Meta */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
