import type { MetadataRoute } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: SITE_URL,
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#1a365d",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["business", "finance"],
    lang: "es",
  };
}
