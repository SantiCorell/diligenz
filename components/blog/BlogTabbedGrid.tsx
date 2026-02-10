"use client";

import { useState } from "react";
import Link from "next/link";
import BlogPostImage from "@/components/blog/BlogPostImage";

const ITEMS_PER_PAGE = 4;

type CardItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
};

type Props = {
  articles: CardItem[];
  casos: CardItem[];
  articlePage: number;
  casosPage: number;
  totalArticlePages: number;
  totalCasosPages: number;
  initialTab: "articulos" | "casos";
};

export default function BlogTabbedGrid({
  articles,
  casos,
  articlePage,
  casosPage,
  totalArticlePages,
  totalCasosPages,
  initialTab,
}: Props) {
  const [activeTab, setActiveTab] = useState<"articulos" | "casos">(initialTab);

  const articleSlice = articles.slice(
    (articlePage - 1) * ITEMS_PER_PAGE,
    articlePage * ITEMS_PER_PAGE
  );
  const casosSlice = casos.slice(
    (casosPage - 1) * ITEMS_PER_PAGE,
    casosPage * ITEMS_PER_PAGE
  );
  const items = activeTab === "articulos" ? articleSlice : casosSlice;
  const currentPage = activeTab === "articulos" ? articlePage : casosPage;
  const totalPages = activeTab === "articulos" ? totalArticlePages : totalCasosPages;
  const basePath = activeTab === "articulos" ? "/blog" : "/blog/casos-exito";
  const label = activeTab === "articulos" ? "Artículos" : "Casos de éxito";

  function paginationHref(page: number) {
    if (activeTab === "articulos") {
      return page === 1 ? "/blog" : `/blog?page=${page}`;
    }
    return page === 1 ? "/blog?casosPage=1" : `/blog?casosPage=${page}`;
  }

  return (
    <>
      {/* Tabs: estilo Diligenz */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Link
          href="/blog"
          onClick={() => setActiveTab("articulos")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === "articulos"
              ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/25"
              : "bg-white text-[var(--brand-primary)] border-2 border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/5"
          }`}
          aria-pressed={activeTab === "articulos"}
          aria-label="Ver artículos"
        >
          Artículos
        </Link>
        <Link
          href="/blog?casosPage=1"
          onClick={() => setActiveTab("casos")}
          className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === "casos"
              ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/25"
              : "bg-white text-[var(--brand-primary)] border-2 border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/5"
          }`}
          aria-pressed={activeTab === "casos"}
          aria-label="Ver casos de éxito"
        >
          Casos de éxito
        </Link>
      </div>

      {/* Grid 2 columnas - 4 items por página */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
        role="region"
        aria-label={`Listado de ${label.toLowerCase()}`}
      >
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className="group flex flex-col rounded-2xl border border-[var(--brand-primary)]/15 bg-white overflow-hidden hover:shadow-xl hover:border-[var(--brand-primary)]/25 transition-all duration-300"
          >
            <div className="relative aspect-[16/10] w-full bg-white overflow-hidden">
              <BlogPostImage
                src={item.image}
                alt=""
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col flex-1 p-5 md:p-6">
              <time className="text-xs font-medium text-[var(--brand-primary)] opacity-90">
                {new Date(item.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <span className="text-xs text-[var(--foreground)] opacity-70 ml-1">
                · {item.readTime}
              </span>
              <h2 className="mt-2 text-lg font-bold text-[var(--brand-primary)] line-clamp-2 group-hover:underline">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--foreground)] opacity-85 line-clamp-2 flex-1">
                {item.excerpt}
              </p>
              <span className="mt-4 text-sm font-semibold text-[var(--brand-primary)]">
                Leer más →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Paginación"
        >
          {currentPage > 1 && (
            <Link
              href={paginationHref(currentPage - 1)}
              className="rounded-lg border border-[var(--brand-primary)]/30 px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition"
            >
              ← Anterior
            </Link>
          )}
          <span className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
              p === currentPage ? (
                <span
                  key={p}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-sm font-semibold text-white"
                  aria-current="page"
                >
                  {p}
                </span>
              ) : (
                <Link
                  key={p}
                  href={paginationHref(p)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--brand-primary)]/30 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition"
                >
                  {p}
                </Link>
              )
            )}
          </span>
          {currentPage < totalPages && (
            <Link
              href={paginationHref(currentPage + 1)}
              className="rounded-lg border border-[var(--brand-primary)]/30 px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition"
            >
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
