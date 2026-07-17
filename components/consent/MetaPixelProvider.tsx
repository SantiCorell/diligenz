"use client";

import { Suspense } from "react";
import ConditionalMetaPixel from "@/components/consent/ConditionalMetaPixel";

/** Suspense requerido por useSearchParams en el Pixel (App Router). */
export default function MetaPixelProvider() {
  return (
    <Suspense fallback={null}>
      <ConditionalMetaPixel />
    </Suspense>
  );
}
