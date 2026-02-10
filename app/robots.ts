import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/documents",
          "/login",
          "/register",
          "/acceso",
          "/companies/mi-interes",
          "/error",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/sell", "/blog/", "/servicios", "/sobre-nosotros", "/companies", "/contact"],
        disallow: ["/api/", "/admin", "/dashboard", "/documents", "/login", "/register", "/acceso", "/companies/mi-interes"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/sell", "/blog/", "/servicios", "/sobre-nosotros", "/companies", "/companies/", "/contact"],
        disallow: ["/api/", "/admin", "/dashboard", "/login", "/register", "/acceso", "/companies/mi-interes"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/documents", "/login", "/register", "/acceso", "/companies/mi-interes"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
