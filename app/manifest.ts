import type { MetadataRoute } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

/** Icono PWA: logo blanco sobre fondo #2F175F (paleta) para acceso directo en móvil */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Compra, vende y valora empresas`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#2F175F",
    theme_color: "#2F175F",
    icons: [
      {
        src: "/icon-pwa.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-pwa.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    categories: ["business", "finance"],
    lang: "es",
  };
}
