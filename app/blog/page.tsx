import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { CASOS_EXITO } from "@/lib/casos-exito";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import BlogTabbedGrid from "@/components/blog/BlogTabbedGrid";

const ITEMS_PER_PAGE = 4;

export const metadata: Metadata = {
  title: `Blog M&A | Guías para comprar y vender empresas en España | ${SITE_NAME}`,
  description:
    "Guías prácticas sobre compraventa de empresas, valoración, due diligence y M&A en España. Consejos para vendedores e inversores. Explora el catálogo de empresas en venta.",
  keywords: [
    "valoración empresas España",
    "due diligence España",
    "M&A España",
    "vender empresa España",
    "comprar empresa España",
    "blog M&A",
    "casos de éxito venta empresas",
  ],
  openGraph: {
    title: `Blog M&A España | ${SITE_NAME}`,
    description:
      "Artículos y casos de éxito sobre valoración, due diligence y compraventa de empresas en España.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

type PageProps = {
  searchParams: Promise<{ page?: string; casosPage?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const articles = [...BLOG_POSTS].sort((a, b) =>
    b.date > a.date ? 1 : -1
  );
  const casos = [...CASOS_EXITO].sort((a, b) => (b.date > a.date ? 1 : -1));

  const articlePage = Math.max(
    1,
    Math.min(
      Math.ceil(articles.length / ITEMS_PER_PAGE),
      parseInt(params.page ?? "1", 10) || 1
    )
  );
  const casosPage = Math.max(
    1,
    Math.min(
      Math.ceil(casos.length / ITEMS_PER_PAGE),
      parseInt(params.casosPage ?? "1", 10) || 1
    )
  );
  const totalArticlePages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const totalCasosPages = Math.ceil(casos.length / ITEMS_PER_PAGE);
  const initialTab = params.casosPage != null ? "casos" : "articulos";

  return (
    <ShellLayout>
      <div className="relative">
        <section className="relative px-4 py-10 text-center sm:px-6 md:py-14">
          <div className="mx-auto max-w-4xl">
            <h1 className="page-title">Blog</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--foreground)]/75 sm:text-base">
              Noticias, guías y casos reales sobre valoración, due diligence y compraventa de empresas.
            </p>
            <p className="mt-1 text-xs text-[var(--foreground)]/65 sm:text-sm">
              Elige entre artículos de fondo o casos de éxito con Diligenz.
            </p>
          </div>
        </section>

        <section className="py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-6">
            <BlogTabbedGrid
              articles={articles}
              casos={casos}
              articlePage={articlePage}
              casosPage={casosPage}
              totalArticlePages={totalArticlePages}
              totalCasosPages={totalCasosPages}
              initialTab={initialTab}
            />
          </div>
        </section>

        <section className="relative py-10">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-[var(--foreground)]/75">
              ¿Quiere valorar su empresa o explorar una venta con criterio?
            </p>
            <a
              href="/servicios#pricing"
              className="btn-primary mt-4 inline-block"
            >
              Ver servicios y precios
            </a>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
