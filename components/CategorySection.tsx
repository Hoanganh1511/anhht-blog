"use client";

import Link from "next/link";
import Image from "next/image";
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

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  const mo = Math.floor(d / 30);
  return `${mo} tháng trước`;
}

function SectionHeader({
  category,
  parentName,
}: {
  category: CategoryData;
  parentName?: string;
}) {
  return (
    <div className="mb-3">
      <Link
        href={`/category/${category.slug}`}
        className="inline-flex items-center gap-6px group"
      >
        <h2 className="font-mono uppercase font-bold tracking-[2px] text-base">
          {parentName && (
            <span className="text-muted mr-2">{parentName} /</span>
          )}
          {category.name}
        </h2>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-muted group-hover:text-ink transition-colors mt-2px"
        >
          <path
            d="M5 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}

function PostListItem({
  post,
  authorImage,
  authorName,
}: {
  post: ArticlePost;
  authorImage?: string | null;
  authorName?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
      }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex items-start gap-3 py-10px border-b b-soft last:border-0 group"
      >
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-accent-blue transition-colors">
            {post.title}
          </p>
          <div className="flex items-center gap-2 mt-6px text-xs text-muted">
            {/* ♡ likes */}
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 14s-6-3.5-6-7.5a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6.5C14 10.5 8 14 8 14z" />
              </svg>
              {post.likesCount}
            </span>
            {/* bookmark */}
            <span className="flex items-center">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                <path d="M3 2h10a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z" />
              </svg>
            </span>
            {/* avatar */}
            {authorImage && (
              <div className="w-4 h-4 rounded-full overflow-hidden bg-surface shrink-0">
                <Image src={authorImage} alt={authorName ?? ""} width={16} height={16} className="w-full h-full object-cover" />
              </div>
            )}
            {/* name */}
            <span>{authorName ?? "Tuấn Anh"}</span>
            {/* separator + time */}
            {post.publishedAt && (
              <>
                <span style={{ color: "#D4D4D4" }}>|</span>
                <span>{timeAgo(post.publishedAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        {post.coverImage && (
          <div className="shrink-0 w-12 rounded-lg overflow-hidden bg-surface" style={{ aspectRatio: "9/16" }}>
            <Image
              src={post.coverImage}
              alt={post.title}
              width={48}
              height={85}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export function CategorySection({
  category,
  parentName,
  index,
  variant = "cards",
  authorImage,
  authorName,
  isLoggedIn = false,
}: {
  category: CategoryData;
  parentName?: string;
  index: number;
  variant?: "cards" | "list";
  authorImage?: string | null;
  authorName?: string;
  isLoggedIn?: boolean;
}) {
  const posts = category.posts.map((r) => r.post);
  if (posts.length === 0) return null;

  if (variant === "list") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: index * 0.1 }}
        className="pb-[20px]"
      >
        <SectionHeader category={category} parentName={parentName} />

        {/* Mobile: list */}
        <motion.div
          className="md:hidden"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: index * 0.1 + 0.05,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              post={post}
              authorImage={authorImage}
              authorName={authorName}
            />
          ))}
        </motion.div>

        <div className="md:hidden mt-3 flex justify-center">
          <Link
            href={`/category/${category.slug}`}
            className="font-mono text-xs text-muted/60 hover:text-ink transition-colors py-2 px-4"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Desktop: cards */}
        <motion.div
          className="hidden md:flex gap-10px sm:gap-3 overflow-x-auto no-scrollbar pb-2"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: index * 0.1 + 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={{
                hidden: { opacity: 0, x: 12 },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.35, ease: EASE },
                },
              }}
            >
              <ArticleCard post={post} isLoggedIn={isLoggedIn} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    );
  }

  // cards variant (default)
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: index * 0.1 }}
      className="pb-[20px]"
    >
      <SectionHeader category={category} parentName={parentName} />

      <motion.div
        className="flex gap-10px sm:gap-3 overflow-x-auto no-scrollbar pb-2"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.06,
              delayChildren: index * 0.1 + 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={{
              hidden: { opacity: 0, x: 12 },
              show: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.35, ease: EASE },
              },
            }}
          >
            <ArticleCard post={post} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
