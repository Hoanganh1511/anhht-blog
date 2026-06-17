import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import { BackButton } from "@/components/BackButton";
import { PostContentClient } from "@/components/PostContentClient";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await serverFetch(`/posts/${slug}`);
  if (!res.ok) return {};
  const post = await res.json();
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    openGraph: { images: post.ogImage ? [post.ogImage] : [] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const res = await serverFetch(`/posts/${slug}`);
  if (res.status === 404) notFound();
  const post = await res.json();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <BackButton />
      <article>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover border border-line mb-8"
          />
        )}

        <header className="mb-8">
          <h1 className="font-sans text-3xl font-bold leading-tight mb-3">{post.title}</h1>
          <div className="flex items-center gap-4 font-mono text-xs text-muted">
            {post.publishedAt && (
              <time>
                {new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </time>
            )}
            <span>♥ {post._count?.likes ?? 0}</span>
            <span>👁 {post.viewCount}</span>
          </div>
        </header>

        <PostContentClient blocks={post.content ?? []} />
      </article>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="font-mono uppercase tracking-[2px] text-sm mb-4">Bình luận</h2>
        <p className="font-mono text-xs text-muted">[Comment section sẽ implement ở Phase 4]</p>
      </section>
    </main>
  );
}
