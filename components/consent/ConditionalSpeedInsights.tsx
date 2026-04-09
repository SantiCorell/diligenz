"use client";

import { useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  CONSENT_EVENT,
  hasAnalyticsConsent,
} from "@/lib/cookie-consent";

export default function ConditionalSpeedInsights() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = () => setShow(hasAnalyticsConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!show) return null;
  return <SpeedInsights />;
}
