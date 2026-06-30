"use client";

import { useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useModal } from "@/lib/modal-context";
import { LoginPopup } from "@/components/LoginPopup";

interface Props {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "fill 0.15s ease" }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "fill 0.15s ease" }}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function PostReactions({
  postId,
  initialLiked,
  initialCount,
  initialSaved,
  isLoggedIn,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [saved, setSaved] = useState(initialSaved);
  const likeInFlight = useRef(false);
  const saveInFlight = useRef(false);
  const { open, close } = useModal();

  const openLogin = () => open(<LoginPopup onClose={close} />, { size: "sm" });

  const handleLike = async () => {
    if (!isLoggedIn) { openLogin(); return; }
    if (likeInFlight.current) return;

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    likeInFlight.current = true;

    try {
      const res = await apiFetch(`/posts/${postId}/like`, { method: "POST" });
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

  const handleSave = async () => {
    if (!isLoggedIn) { openLogin(); return; }
    if (saveInFlight.current) return;

    const prevSaved = saved;
    setSaved(!saved);
    saveInFlight.current = true;

    try {
      const res = await apiFetch(`/posts/${postId}/save`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSaved(data.saved);
    } catch {
      setSaved(prevSaved);
    } finally {
      saveInFlight.current = false;
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 py-10 my-10 border-t border-b border-line/20">
      {/* Like */}
      <button
        type="button"
        onClick={handleLike}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors cursor-pointer"
        style={{
          color: liked ? "#e11d48" : undefined,
          backgroundColor: liked ? "rgba(225,29,72,0.07)" : undefined,
        }}
      >
        <span className={liked ? "" : "text-muted"}>
          <HeartIcon filled={liked} />
        </span>
        <span className="font-mono text-sm" style={{ color: liked ? "#e11d48" : undefined }}>
          {count > 0 ? `${count} ` : ""}
          {liked ? "Đã thích" : "Thích"}
        </span>
      </button>

      <div className="w-px h-5 bg-line/20" />

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors cursor-pointer"
        style={{
          color: saved ? "var(--ink)" : undefined,
          backgroundColor: saved ? "var(--surface)" : undefined,
        }}
      >
        <span className={saved ? "text-ink" : "text-muted"}>
          <BookmarkIcon filled={saved} />
        </span>
        <span className={`font-mono text-sm ${saved ? "text-ink" : "text-muted"}`}>
          {saved ? "Đã lưu" : "Lưu bài"}
        </span>
      </button>
    </div>
  );
}
