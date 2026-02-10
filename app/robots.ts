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
          "/sell",
          "/login",
          "/register",
          "/acceso",
          "/companies/mi-interes",
          "/error",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/documents", "/sell", "/login", "/register", "/acceso", "/companies/mi-interes"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog/", "/servicios", "/sobre-nosotros", "/companies", "/companies/"],
        disallow: ["/api/", "/admin", "/dashboard", "/login", "/register", "/acceso"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/documents", "/sell", "/login", "/register", "/acceso"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
