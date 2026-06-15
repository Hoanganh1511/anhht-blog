import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

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
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-8 border-b border-line pb-4">
        <a href="/" className="font-mono text-xs text-muted mb-2 block">← Trang chủ</a>
        <h1 className="font-mono uppercase tracking-[2px] text-xl">{category.name}</h1>
        <p className="font-mono text-xs text-muted mt-1">{total} bài viết</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post: any) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="border border-line bg-surface p-4 flex flex-col justify-between min-h-30 hover:bg-paper transition-colors"
          >
            <span className="font-sans font-semibold text-sm leading-snug">{post.title}</span>
            {post.excerpt && (
              <p className="font-sans text-xs text-muted mt-2 line-clamp-2">{post.excerpt}</p>
            )}
            <span className="font-mono text-[10px] text-muted mt-3">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : ""}
              {" · "}♥ {post.likes.length}
            </span>
          </a>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex gap-2 font-mono text-xs">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/category/${slug}?page=${p}`}
              className={[
                "border border-line px-3 py-1",
                p === page ? "bg-ink text-paper" : "bg-surface hover:bg-paper",
              ].join(" ")}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </main>
  );
}
