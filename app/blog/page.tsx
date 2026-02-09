import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata = {
  title: "Blog | Noticias sobre valoración y compraventa de empresas",
  description:
    "Artículos sobre valoración de empresas, due diligence, M&A y venta de pymes. Consejos y tendencias del sector.",
};

export default function BlogPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-12 md:py-14">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
              Blog
            </h1>
            <p className="mt-3 text-[var(--foreground)] opacity-90">
              Noticias y guías sobre valoración, due diligence y compraventa de empresas.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-6">
            <ul className="space-y-10">
              {BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)] overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative aspect-video md:aspect-square bg-[var(--brand-primary)]/10">
                        <Image
                          src={post.image}
                          alt=""
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-6 md:p-8 flex flex-col justify-center">
                        <time className="text-sm text-[var(--brand-primary)] opacity-80">
                          {new Date(post.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <span className="text-sm text-[var(--foreground)] opacity-70 ml-2">
                          · {post.readTime} de lectura
                        </span>
                        <h2 className="mt-2 text-xl font-bold text-[var(--brand-primary)] group-hover:underline">
                          {post.title}
                        </h2>
                        <p className="mt-2 text-[var(--foreground)] opacity-85 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <span className="mt-3 text-sm font-medium text-[var(--brand-primary)]">
                          Leer más →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
