"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useModal } from "@/lib/modal-context";
import { LoginPopup } from "@/components/LoginPopup";

export interface ArticlePost {
  id: string;
  slug: string;
  title: string;
  publishedAt: string | null;
  coverImage?: string | null;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      style={{ transition: "fill 0.12s ease" }}
    >
      <path d="M8 13.5S1.5 9.5 1.5 5.5A3.5 3.5 0 0 1 8 3.685 3.5 3.5 0 0 1 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="14"
      viewBox="0 0 14 16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      style={{ transition: "fill 0.12s ease" }}
    >
      <path d="M2 2.5A1.5 1.5 0 0 1 3.5 1h7A1.5 1.5 0 0 1 12 2.5V15L7 12 2 15V2.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArticleCard({
  post,
  isLoggedIn = false,
}: {
  post: ArticlePost;
  isLoggedIn?: boolean;
}) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [count, setCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.savedByMe);
  const likeInFlight = useRef(false);
  const saveInFlight = useRef(false);
  const { open, close } = useModal();

  const openLogin = () => open(<LoginPopup onClose={close} />, { size: "sm" });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { openLogin(); return; }
    if (likeInFlight.current) return;

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    likeInFlight.current = true;

    try {
      const res = await apiFetch(`/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      likeInFlight.current = false;
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { openLogin(); return; }
    if (saveInFlight.current) return;

    const prevSaved = saved;
    setSaved(!saved);
    saveInFlight.current = true;

    try {
      const res = await apiFetch(`/posts/${post.id}/save`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaved(data.saved);
    } catch {
      setSaved(prevSaved);
    } finally {
      saveInFlight.current = false;
    }
  };

  const imgSrc = post.coverImage ?? `https://picsum.photos/seed/${post.slug}/400/260`;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "short" })
    : null;

  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      className="shrink-0 w-44 sm:w-52 md:w-60 flex flex-col"
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col">
        <div className="overflow-hidden mb-10px sm:mb-3 shrink-0 rounded-lg" style={{ aspectRatio: "9/16" }}>
          <motion.img
            src={imgSrc}
            alt={post.title}
            className="w-full h-full object-cover"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>

        <div className="relative mb-6px">
          <h4 className="font-mono text-sm font-semibold leading-snug line-clamp-2 sm:line-clamp-3">
            {post.title}
          </h4>
          <motion.div
            variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
            style={{ transformOrigin: "left" }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute neg-bottom-2px left-0 right-0 h-px bg-ink"
          />
        </div>
      </Link>

      {/* Actions row */}
      <div className="flex items-center justify-between mt-auto pt-2">
        {date && <span className="font-mono text-xs text-muted">{date}</span>}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 font-mono text-xs transition-colors p-2 -mr-1 rounded-lg active:scale-90 ${
              liked ? "text-accent-coral" : "text-muted hover:text-ink"
            }`}
          >
            <HeartIcon filled={liked} />
            <span>{count > 0 ? count : ""}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`transition-colors p-2 rounded-lg active:scale-90 ${
              saved ? "text-accent-blue" : "text-muted hover:text-ink"
            }`}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
