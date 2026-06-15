import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    openGraph: { images: post.ogImage ? [post.ogImage] : [] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      likes: true,
    },
  });

  if (!post) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <article>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover border border-[var(--line)] mb-8"
          />
        )}

        <header className="mb-8">
          <h1 className="font-sans text-3xl font-bold leading-tight mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 font-mono text-xs text-[var(--muted)]">
            {post.publishedAt && (
              <time>
                {new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            )}
            <span>♥ {post.likes.length}</span>
            <span>👁 {post.viewCount}</span>
          </div>
        </header>

        {/* BlockNote content renderer — sẽ implement ở Phase 2 */}
        <div className="prose font-sans text-[var(--ink)]">
          <p className="font-mono text-xs text-[var(--muted)]">
            [Content renderer sẽ implement ở Phase 2]
          </p>
        </div>
      </article>

      {/* Comments section — sẽ implement ở Phase 4 */}
      <section className="mt-16 border-t border-[var(--line)] pt-8">
        <h2 className="font-mono uppercase tracking-[2px] text-sm mb-4">
          Bình luận
        </h2>
        <p className="font-mono text-xs text-[var(--muted)]">
          [Comment section sẽ implement ở Phase 4]
        </p>
      </section>
    </main>
  );
}
