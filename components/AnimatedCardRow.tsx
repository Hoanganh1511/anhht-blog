"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "@/components/ArticleCard";
import type { ArticlePost } from "@/components/ArticleCard";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function AnimatedCardRow({ posts }: { posts: ArticlePost[] }) {
  return (
    <motion.div
      className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
      initial="hidden"
      animate="show"
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          variants={{
            hidden: { opacity: 0, x: 14 },
            show: { opacity: 1, x: 0, transition: { duration: 0.38, ease: EASE } },
          }}
        >
          <ArticleCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
}
