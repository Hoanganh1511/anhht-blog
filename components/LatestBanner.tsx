"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Post {
  slug: string;
  title: string;
  publishedAt: string | null;
}

export function LatestBanner({ post }: { post: Post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="bg-surface"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex items-center gap-3 px-4 md:px-12 xl:px-24 py-2.5 transition-colors hover:bg-paper group"
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[2px] text-accent-coral shrink-0">
          <motion.span
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-accent-coral"
          />
          Mới nhất
        </span>

        <span className="font-mono text-[10px] text-muted select-none">|</span>

        <span className="font-sans text-sm flex-1 truncate text-muted group-hover:text-ink transition-colors">
          {post.title}
        </span>

        {date && (
          <span className="font-mono text-[10px] text-muted hidden sm:block shrink-0">
            {date}
          </span>
        )}

        <motion.span
          className="font-mono text-xs text-muted shrink-0"
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          initial="rest"
          whileHover="hover"
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          →
        </motion.span>
      </Link>
    </motion.div>
  );
}
