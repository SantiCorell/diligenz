"use client";

import { useEffect } from "react";
import { setCustomSectorVisuals } from "@/lib/sector-visual";

/** Carga sectores personalizados para iconos/etiquetas en componentes cliente. */
export default function SectorCatalogHydrator() {
  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then((d: { customVisualMap?: Record<string, { label: string; shortLabel: string; iconKey: string; colorKey: string }> }) => {
        if (d.customVisualMap) setCustomSectorVisuals(d.customVisualMap);
      })
      .catch(() => {});
  }, []);

  return null;
}
