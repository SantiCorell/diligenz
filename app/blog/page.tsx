import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { CASOS_EXITO } from "@/lib/casos-exito";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import BlogTabbedGrid from "@/components/blog/BlogTabbedGrid";

const ITEMS_PER_PAGE = 4;

export const metadata: Metadata = {
  title: `Blog M&A España | Valoración, due diligence y compraventa de empresas | ${SITE_NAME}`,
  description:
    "Guías y artículos sobre valoración de empresas, due diligence y M&A en España. Casos de éxito y consejos para vender o comprar pymes.",
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
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-8 md:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)] tracking-tight">
              Blog
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-2xl mx-auto">
              Noticias, guías y casos reales sobre valoración, due diligence y compraventa de empresas.
            </p>
            <p className="mt-0.5 text-xs sm:text-sm text-[var(--foreground)] opacity-80">
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

        <section className="border-t border-[var(--brand-primary)]/10 py-6 bg-[var(--brand-bg-lavender)]/50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-[var(--foreground)] opacity-85">
              ¿Quiere valorar su empresa o explorar una venta con criterio?
            </p>
            <a
              href="/servicios#pricing"
              className="mt-3 inline-block rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Ver servicios y precios
            </a>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
