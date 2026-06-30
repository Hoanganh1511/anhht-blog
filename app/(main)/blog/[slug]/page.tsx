import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import { getSession } from "@/lib/session";
import { BackButton } from "@/components/BackButton";
import { PostContentClient } from "@/components/PostContentClient";
import { CoverGallery } from "@/components/CoverGallery";
import { TableOfContents, type HeadingItem } from "@/components/TableOfContents";
import { StickyAuthorBar } from "@/components/StickyAuthorBar";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(blocks: unknown[]): HeadingItem[] {
  const result: HeadingItem[] = [];
  function walk(blocks: unknown[]) {
    for (const block of blocks as any[]) {
      if (block.type === "heading") {
        const text = (block.content ?? [])
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("")
          .trim();
        if (text) result.push({ id: slugify(text), text, level: block.props?.level ?? 2 });
      }
      if (block.children?.length) walk(block.children);
    }
  }
  walk(blocks);
  return result;
}

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
  const [res, session] = await Promise.all([
    serverFetch(`/posts/${slug}`),
    getSession(),
  ]);
  if (res.status === 404) notFound();
  const post = await res.json();

  const authorName = session?.user?.name ?? "Tuấn Anh";
  const authorImage = session?.user?.image ?? null;
  const headings = extractHeadings(post.content ?? []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <StickyAuthorBar
        authorName={authorName}
        authorImage={authorImage}
        isLoggedIn={!!session}
      />

      <BackButton />
      <article>
        <CoverGallery
          coverImage={post.coverImage}
          coverImages={post.coverImages}
        />

        <header className="mb-8">
          <h1 className="font-sans text-3xl font-bold leading-tight mb-3">{post.title}</h1>
          <div className="sticky top-13 md:top-16 z-10 -mx-4 px-4 py-2 bg-paper border-b border-line/20 flex items-center gap-4 font-mono text-xs text-muted">
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

        {/* Sentinel: when this exits viewport top → StickyAuthorBar appears */}
        <div id="post-header-sentinel" />

        <TableOfContents headings={headings} />

        <PostContentClient blocks={post.content ?? []} />
      </article>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="font-mono uppercase tracking-[2px] text-sm mb-4">Bình luận</h2>
        <p className="font-mono text-xs text-muted">[Comment section sẽ implement ở Phase 4]</p>
      </section>
    </main>
  );
}
