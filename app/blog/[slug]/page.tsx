import { notFound } from "next/navigation";
import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllSlugs } from "@/lib/blog-posts";

function renderBody(body: string) {
  return body.split(/\n\n+/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const withStrong = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const withBreaks = withStrong.split(/\n/).join("<br />");
    return <p key={i} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: withBreaks }} />;
  });
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Entrada no encontrada" };
  return {
    title: `${post.title} | Blog Diligenz`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <ShellLayout>
      <article className="min-h-screen bg-[var(--brand-bg)]">
        <header className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <Link href="/blog" className="text-sm text-[var(--brand-primary)] hover:underline">
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
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
              {post.title}
            </h1>
            <p className="mt-3 text-lg text-[var(--foreground)] opacity-90">
              {post.excerpt}
            </p>
          </div>
        </header>

        <div className="relative h-64 md:h-96 w-full bg-[var(--brand-bg-lavender)]">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 text-[var(--foreground)]">
          <div className="prose prose-lg max-w-none opacity-90">
            {renderBody(post.body)}
          </div>
          <p className="mt-8 pt-6 border-t border-[var(--brand-primary)]/20 text-sm opacity-80">
            ¿Quiere valorar su empresa o explorar una venta?{" "}
            <Link href="/servicios#pricing" className="text-[var(--brand-primary)] font-medium hover:underline">
              Consulte nuestros servicios y precios
            </Link>
            .
          </p>
          <Link href="/blog" className="inline-block mt-6 text-[var(--brand-primary)] font-medium hover:underline">
            ← Volver al blog
          </Link>
        </div>
      </article>
    </ShellLayout>
  );
}
