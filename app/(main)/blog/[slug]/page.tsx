import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import { getSession } from "@/lib/session";
import { BackButton } from "@/components/BackButton";
import { PostContentClient } from "@/components/PostContentClient";
import { CoverGallery } from "@/components/CoverGallery";
import {
  TableOfContents,
  type HeadingItem,
} from "@/components/TableOfContents";
import { StickyAuthorBar } from "@/components/StickyAuthorBar";
import { PostReactions } from "@/components/PostReactions";
import { PostAuthorCard } from "@/components/PostAuthorCard";
import Image from "next/image";
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
        if (text)
          result.push({
            id: slugify(text),
            text,
            level: block.props?.level ?? 2,
          });
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
    <main className="max-w-3xl mx-auto px-4 pt-4 pb-12">
      <StickyAuthorBar
        authorName={authorName}
        authorImage={authorImage}
        isLoggedIn={!!session}
        isAuthor={session?.user?.role === "ADMIN"}
      />

      {/* <BackButton /> */}
      <article>
        <CoverGallery
          coverImage={post.coverImage}
          coverImages={post.coverImages}
        />

        <header className="mb-8">
          <h1 className="font-sans text-xl font-bold leading-tight mb-5">
            {post.title}
          </h1>

          {/* Sticky metadata bar — views only, date moves to author section */}
          {/* <div className="px-4 py-2 bg-paper border-b border-line/20 flex items-center gap-4 font-mono text-xs text-muted">
            <span>👁 {post.viewCount}</span>
          </div> */}

          {/* Author info */}
          <div className="flex items-center gap-3 pb-2">
            {authorImage ? (
              <Image
                src={authorImage}
                alt={authorName}
                width={40}
                height={40}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface border border-line shrink-0 flex items-center justify-center font-mono text-sm text-muted">
                {authorName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-[14px] text-ink">{authorName}</p>
              {post.publishedAt && (
                <p className="font-mono text-[12px] text-muted mt-0.5">
                  {new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Sentinel: when this exits viewport top → StickyAuthorBar appears */}
        <div id="post-header-sentinel" />

        <TableOfContents headings={headings} />

        <PostContentClient blocks={post.content ?? []} />
      </article>

      <PostReactions
        postId={post.id}
        initialLiked={post.likedByMe ?? false}
        initialCount={post._count?.likes ?? 0}
        initialSaved={post.savedByMe ?? false}
        isLoggedIn={!!session}
        authorName={authorName}
      />

      <PostAuthorCard name={authorName} image={authorImage} />

      <section className="mt-8 border-t border-line pt-8">
        <h2 className="font-mono uppercase tracking-[2px] text-sm mb-4">
          Bình luận
        </h2>
        <p className="font-mono text-xs text-muted">
          [Comment section sẽ implement ở Phase 4]
        </p>
      </section>
    </main>
  );
}
