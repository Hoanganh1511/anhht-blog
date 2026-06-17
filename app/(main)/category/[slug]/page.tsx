import { notFound } from "next/navigation";
import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import { AnimatedCardRow } from "@/components/AnimatedCardRow";
import type { ArticlePost } from "@/components/ArticleCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await serverFetch(`/categories/${slug}`);
  if (!res.ok) return {};
  const { category } = await res.json();
  return { title: category.name };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));

  const res = await serverFetch(`/categories/${slug}?page=${page}`);
  if (res.status === 404) notFound();
  const { category, posts, total, pageSize } = await res.json();
  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="px-4 md:px-8 xl:px-12 py-10">
      {/* Category title */}
      <h1 className="font-sans text-3xl md:text-4xl font-bold mb-1">
        {category.parent && (
          <>
            {category.parent.name}
            <span className="mx-3 text-xl opacity-40">●</span>
          </>
        )}
        {category.name}
      </h1>
      <p className="font-mono text-sm text-muted mb-10">{total} bài viết</p>

      <AnimatedCardRow posts={posts as ArticlePost[]} />

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center gap-5 font-mono text-xs text-muted">
          {page > 1 && (
            <Link href={`/category/${slug}?page=${page - 1}`} className="hover:text-ink transition-colors">
              ←
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${slug}?page=${p}`}
              className={p === page ? "text-ink" : "hover:text-ink transition-colors"}
            >
              {p === page ? `[${p}]` : p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`/category/${slug}?page=${page + 1}`} className="hover:text-ink transition-colors">
              →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
