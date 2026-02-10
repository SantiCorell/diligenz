import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllSlugs } from "@/lib/blog-posts";
import { prisma } from "@/lib/prisma";

/** Rutas estáticas públicas con prioridad y frecuencia */
const STATIC_ROUTES: { url: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { url: "", priority: 1, changeFrequency: "weekly" },
  { url: "companies", priority: 0.95, changeFrequency: "weekly" },
  { url: "sell", priority: 0.92, changeFrequency: "weekly" },
  { url: "servicios", priority: 0.9, changeFrequency: "monthly" },
  { url: "sobre-nosotros", priority: 0.8, changeFrequency: "monthly" },
  { url: "contact", priority: 0.85, changeFrequency: "monthly" },
  { url: "blog", priority: 0.9, changeFrequency: "weekly" },
  { url: "politica-privacidad", priority: 0.3, changeFrequency: "yearly" },
  { url: "politica-cookies", priority: 0.3, changeFrequency: "yearly" },
  { url: "aviso-legal", priority: 0.3, changeFrequency: "yearly" },
  { url: "login", priority: 0.5, changeFrequency: "monthly" },
  { url: "register", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ url, priority, changeFrequency }) => ({
    url: url ? `${base}/${url}` : base,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Entradas del blog
  const slugs = getAllSlugs();
  for (const slug of slugs) {
    entries.push({
      url: `${base}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Empresas publicadas (solo IDs para URLs canónicas)
  try {
    const published = await prisma.deal.findMany({
      where: { published: true },
      select: { companyId: true },
      distinct: ["companyId"],
    });
    const companyIds = [...new Set(published.map((d) => d.companyId))];
    for (const id of companyIds) {
      entries.push({
        url: `${base}/companies/${id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  } catch {
    // Si la DB no está disponible (build sin DB), no se añaden empresas
  }

  return entries;
}
