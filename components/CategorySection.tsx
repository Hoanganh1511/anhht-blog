"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArticleCard } from "@/components/ArticleCard";
import type { ArticlePost } from "@/components/ArticleCard";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  posts: { post: ArticlePost }[];
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function CategorySection({
  category,
  index,
}: {
  category: CategoryData;
  index: number;
}) {
  const posts = category.posts.map((r) => r.post);
  if (posts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: index * 0.1 }}
      className="pb-10"
    >
      <div className="flex items-center justify-between mb-5 pt-0">
        <h2 className="font-mono uppercase tracking-[3px] text-xs">{category.name}</h2>
        <Link
          href={`/category/${category.slug}`}
          className="font-mono text-xs text-muted hover:text-ink transition-colors"
        >
          Xem tất cả →
        </Link>
      </div>

      <motion.div
        className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: index * 0.1 + 0.1 } },
        }}
        initial="hidden"
        animate="show"
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={{
              hidden: { opacity: 0, x: 12 },
              show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
            }}
          >
            <ArticleCard post={post} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
