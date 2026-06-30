"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  likesCount: number;
}

export function FeaturedArticle({ post }: { post: Post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <motion.div initial="rest" animate="rest" whileHover="hover" className="py-7 border-b b-soft">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* title + animated underline */}
        <div className="relative pb-2px">
          <h2 className="font-sans text-2xl font-semibold leading-tight">
            {post.title}
          </h2>
          <motion.div
            variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute bottom-0 left-0 right-0 h-px bg-ink"
          />
        </div>

        {post.excerpt && (
          <p className="font-sans text-sm text-muted mt-10px line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4 font-mono text-xs text-muted">
          {date && <span>{date}</span>}
          <span>♥ {post.likesCount}</span>
          <motion.span
            variants={{ rest: { x: 0, opacity: 0 }, hover: { x: 0, opacity: 1 } }}
            transition={{ duration: 0.2 }}
          >
            Đọc bài →
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
}
