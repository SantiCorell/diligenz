import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import { getPostBySlug, getAllSlugs } from "@/lib/blog-posts";
import BlogPostImage from "@/components/blog/BlogPostImage";
import { SITE_URL, SITE_NAME, SEO_KEYWORDS } from "@/lib/seo";

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
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Entrada no encontrada" };
  const title = `${post.title} | Blog ${SITE_NAME}`;
  const url = `${SITE_URL}/blog/${slug}`;
  const keywords = [
    ...SEO_KEYWORDS.slice(0, 8),
    post.title,
    "blog Diligenz",
    "M&A",
    "venta empresas",
  ];
  return {
    title,
    description: post.excerpt,
    keywords: keywords.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
      siteName: SITE_NAME,
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: url },
  };
}

function getArticleSchema(post: { title: string; excerpt: string; date: string; image: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: post.image,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-dili.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };
}

function getBreadcrumbSchema(post: { title: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = getArticleSchema(post);
  const breadcrumbSchema = getBreadcrumbSchema(post);

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
      <article className="min-h-screen bg-[var(--brand-bg)]" itemScope itemType="https://schema.org/Article">
        <header className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <Link href="/blog" className="text-sm font-medium text-[var(--brand-primary)] hover:underline">
              ← Blog
            </Link>
            <time className="block mt-2 text-sm text-[var(--foreground)] opacity-75">
              {new Date(post.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="text-sm text-[var(--foreground)] opacity-75"> · {post.readTime} de lectura</span>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--brand-primary)] leading-tight tracking-tight">
              {post.title}
            </h1>
            <p className="mt-3 text-lg text-[var(--foreground)] opacity-90 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 pt-6">
          <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-[var(--brand-bg-lavender)] shadow-lg border border-[var(--brand-primary)]/10">
            <BlogPostImage
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-6 text-[var(--foreground)]">
          <article className="prose prose-lg max-w-none prose-headings:text-[var(--brand-primary)] prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4 prose-headings:first:mt-0 prose-strong:text-[var(--foreground)] prose-strong:font-semibold prose-p:leading-relaxed">
            {renderBody(post.body)}
          </article>
          <div className="mt-8 pt-6 border-t border-[var(--brand-primary)]/15">
            <p className="text-sm opacity-85">
              ¿Quiere valorar su empresa o explorar una venta?{" "}
              <Link href="/servicios#pricing" className="font-semibold text-[var(--brand-primary)] hover:underline">
                Consulte nuestros servicios y precios
              </Link>
              .
            </p>
            <Link href="/blog" className="inline-flex items-center gap-1 mt-6 text-sm font-semibold text-[var(--brand-primary)] hover:underline">
              ← Volver al blog
            </Link>
          </div>
        </div>
      </article>
    </ShellLayout>
  );
}
