import type { MetadataRoute } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

/** Icono PWA: LOGO DILI sobre fondo blanco para acceso directo en móvil */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Compra, vende y valora empresas`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/logo-dili.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-dili.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["business", "finance"],
    lang: "es",
  };
}
