"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface ArticlePost {
  id: string;
  slug: string;
  title: string;
  publishedAt: string | null;
  coverImage?: string | null;
  likes: unknown[];
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function ArticleCard({ post }: { post: ArticlePost }) {
  const imgSrc =
    post.coverImage ?? `https://picsum.photos/seed/${post.slug}/400/260`;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      className="shrink-0 w-72 sm:w-80 flex flex-col"
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="overflow-hidden mb-3 shrink-0 rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={imgSrc}
            alt={post.title}
            className="w-full h-40 object-cover"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>

        <div className="flex flex-col flex-1">
          <div className="relative mb-1.5">
            <h4 className="font-mono text-sm font-semibold leading-snug line-clamp-3">
              {post.title}
            </h4>
            <motion.div
              variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: 0.25, ease: EASE }}
              className="absolute -bottom-0.5 left-0 right-0 h-px bg-ink"
            />
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted mt-auto pt-2.5">
            {date && <span>{date}</span>}
            <span>♥ {(post.likes as []).length}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
