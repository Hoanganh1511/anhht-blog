import { notFound } from "next/navigation";
import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import { MobileCategoryBar } from "@/components/MobileCategoryBar";
import { AnimatedCardRow } from "@/components/AnimatedCardRow";
import type { ArticlePost } from "@/components/ArticleCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

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

  const [detailRes, allCatsRes] = await Promise.all([
    serverFetch(`/categories/${slug}?page=${page}`),
    serverFetch("/categories"),
  ]);

  if (detailRes.status === 404) notFound();

  const { category, posts, total, pageSize } = await detailRes.json();
  const allCategories: CategoryMeta[] = allCatsRes.ok
    ? await allCatsRes.json()
    : [];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <MobileCategoryBar categories={allCategories} />
      <main className="px-4 md:px-8 xl:px-12 pt-4 pb-10">
        {/* Section header — same style as CategorySection */}
        <div className="mb-5">
          <h1 className="font-mono uppercase tracking-[3px] text-md font-bold">
            {category.parent && (
              <span className="text-muted mr-2">{category.parent.name} /</span>
            )}
            {category.name}
          </h1>
        </div>

        <AnimatedCardRow posts={posts as ArticlePost[]} />

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center gap-5 font-mono text-xs text-muted">
            {page > 1 && (
              <Link
                href={`/category/${slug}?page=${page - 1}`}
                className="hover:text-ink transition-colors"
              >
                ←
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/category/${slug}?page=${p}`}
                className={
                  p === page ? "text-ink" : "hover:text-ink transition-colors"
                }
              >
                {p === page ? `[${p}]` : p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/category/${slug}?page=${page + 1}`}
                className="hover:text-ink transition-colors"
              >
                →
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
