import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import { getCasoBySlug, getAllCasoSlugs } from "@/lib/casos-exito";
import BlogPostImage from "@/components/blog/BlogPostImage";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

function renderBody(body: string) {
  return body.split(/\n\n+/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    
    // Detectar headings (líneas que empiezan con ** y terminan con **)
    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      return (
        <h2
          key={i}
          className="mt-8 mb-4 text-2xl font-bold text-[var(--brand-primary)] first:mt-0"
        >
          {headingMatch[1]}
        </h2>
      );
    }
    
    const withStrong = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const withBreaks = withStrong.split(/\n/).join("<br />");
    return (
      <p
        key={i}
        className="mb-5 leading-relaxed text-[var(--foreground)] opacity-90"
        dangerouslySetInnerHTML={{ __html: withBreaks }}
      />
    );
  });
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCasoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caso = getCasoBySlug(slug);
  if (!caso) return { title: "Caso no encontrado" };
  const title = `${caso.title} | Casos de éxito M&A ${SITE_NAME}`;
  const url = `${SITE_URL}/blog/casos-exito/${slug}`;
  return {
    title,
    description: caso.excerpt,
    keywords: [
      "caso éxito venta empresa",
      "venta pyme éxito",
      "M&A casos reales",
      "compraventa empresas España",
      caso.title.toLowerCase(),
    ],
    openGraph: {
      title: caso.title,
      description: caso.excerpt,
      url,
      type: "article",
      publishedTime: caso.date,
      authors: [SITE_NAME],
      section: "Casos de éxito",
      images: caso.image
        ? [{ url: caso.image, width: 1200, height: 630, alt: caso.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: caso.title,
      description: caso.excerpt,
    },
    alternates: { canonical: url },
  };
}

function getArticleSchema(caso: {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caso.title,
    description: caso.excerpt,
    datePublished: caso.date,
    dateModified: caso.date,
    image: caso.image,
    url: `${SITE_URL}/blog/casos-exito/${caso.slug}`,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-dili.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/casos-exito/${caso.slug}`,
    },
    articleSection: "Casos de éxito",
    keywords: "venta empresas, M&A, compraventa pymes, casos éxito",
  };
}

function getBreadcrumbSchema(caso: { title: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Casos de éxito",
        item: `${SITE_URL}/blog/casos-exito`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: caso.title,
        item: `${SITE_URL}/blog/casos-exito/${caso.slug}`,
      },
    ],
  };
}

export default async function CasoExitoDetailPage({ params }: Props) {
  const { slug } = await params;
  const caso = getCasoBySlug(slug);
  if (!caso) notFound();

  const articleSchema = getArticleSchema(caso);
  const breadcrumbSchema = getBreadcrumbSchema(caso);

  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <article
        className="min-h-screen bg-[var(--brand-bg)]"
        itemScope
        itemType="https://schema.org/Article"
      >
        <header className="border-b border-[var(--brand-primary)]/10 bg-gradient-to-b from-[var(--brand-bg)] to-[var(--brand-bg-lavender)]/30">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <nav className="text-sm font-medium text-[var(--brand-primary)] mb-4">
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              <span className="mx-2">/</span>
              <Link href="/blog/casos-exito" className="hover:underline">
                Casos de éxito
              </Link>
            </nav>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] bg-[var(--brand-primary)]/10">
                Caso real
              </span>
              <time className="text-sm text-[var(--foreground)] opacity-75">
                {new Date(caso.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-sm text-[var(--foreground)] opacity-75">
                · {caso.readTime} de lectura
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--brand-primary)] leading-tight tracking-tight mb-4">
              {caso.title}
            </h1>
            <p className="text-lg md:text-xl text-[var(--foreground)] opacity-90 leading-relaxed max-w-3xl">
              {caso.excerpt}
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-[var(--brand-bg-lavender)] shadow-md border border-[var(--brand-primary)]/10">
            <BlogPostImage
              src={caso.image}
              alt={caso.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-6 text-[var(--foreground)]">
          <article className="prose prose-lg max-w-none prose-headings:text-[var(--brand-primary)] prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4 prose-headings:first:mt-0 prose-strong:text-[var(--foreground)] prose-strong:font-semibold prose-p:leading-relaxed">
            {renderBody(caso.body)}
          </article>
          <div className="mt-8 pt-6 border-t border-[var(--brand-primary)]/15">
            <p className="text-sm opacity-85">
              ¿Quiere valorar su empresa o explorar una venta con el mismo rigor?{" "}
              <Link
                href="/servicios#pricing"
                className="font-semibold text-[var(--brand-primary)] hover:underline"
              >
                Consulte nuestros servicios y precios
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/blog/casos-exito"
                className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
              >
                ← Ver más casos de éxito
              </Link>
              <Link
                href="/blog"
                className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
              >
                ← Volver al blog
              </Link>
            </div>
          </div>
        </div>
      </article>
    </ShellLayout>
  );
}
