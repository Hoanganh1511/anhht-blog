"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Post {
  slug: string;
  title: string;
  publishedAt: string | null;
  likes: unknown[];
}

interface Props {
  post: Post;
  index: number; // 1-based
}

export function ArticleRow({ post, index }: Props) {
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
      variants={{
        rest: { backgroundColor: "transparent" },
        hover: { backgroundColor: "var(--surface)" },
      }}
      transition={{ duration: 0.15 }}
      className="-mx-2 px-2 border-b b-soft"
    >
      <Link href={`/blog/${post.slug}`} className="flex items-center gap-4 py-3">
        {/* số thứ tự */}
        <span className="font-mono text-[11px] text-muted shrink-0 w-7 select-none tabular-nums">
          {String(index).padStart(2, "0")}
        </span>

        {/* ngày */}
        <span className="font-mono text-[11px] text-muted shrink-0 w-20 hidden sm:block">
          {date ?? "—"}
        </span>

        {/* tiêu đề */}
        <span className="font-sans text-sm flex-1 leading-snug">
          {post.title}
        </span>

        {/* lượt thích */}
        <span className="font-mono text-[11px] text-muted shrink-0 tabular-nums hidden xs:flex items-center gap-1">
          ♥ {post.likes.length}
        </span>

        {/* arrow */}
        <motion.span
          variants={{ rest: { x: 0, opacity: 0.35 }, hover: { x: 5, opacity: 1 } }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="font-mono text-xs text-muted shrink-0"
        >
          →
        </motion.span>
      </Link>
    </motion.div>
  );
}
