"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  BookmarkPlus,
  BookmarkCheck,
  MoreHorizontal,
  Link2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useModal } from "@/lib/modal-context";
import { LoginPopup } from "@/components/LoginPopup";

interface Props {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
  authorName?: string;
}

const SPARKS = [
  { angle: 0, r: 46, size: 7, color: "#e11d48" },
  { angle: 40, r: 38, size: 5, color: "#f97316" },
  { angle: 80, r: 50, size: 6, color: "#eab308" },
  { angle: 125, r: 36, size: 8, color: "#22c55e" },
  { angle: 165, r: 44, size: 5, color: "#e11d48" },
  { angle: 210, r: 40, size: 7, color: "#3b82f6" },
  { angle: 250, r: 46, size: 5, color: "#a855f7" },
  { angle: 295, r: 38, size: 6, color: "#f97316" },
  { angle: 335, r: 48, size: 5, color: "#ec4899" },
].map((s) => ({
  ...s,
  x: Math.cos((s.angle * Math.PI) / 180) * s.r,
  y: Math.sin((s.angle * Math.PI) / 180) * s.r,
}));

function LikePopover({ authorName }: { authorName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        left: 0,
        zIndex: 50,
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 12px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
        minWidth: 200,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Spark burst + heart */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 32,
          paddingBottom: 14,
          paddingLeft: 44,
          paddingRight: 44,
        }}
      >
        {SPARKS.map((s, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              backgroundColor: s.color,
              left: "50%",
              top: "50%",
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.06 + i * 0.025,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: [0.1, 1.45, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.5, times: [0, 0.58, 1] }}
          style={{
            fontSize: 48,
            lineHeight: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          ❤️
        </motion.div>
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.3 }}
        style={{
          textAlign: "center",
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 22,
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#1A1A1A",
            marginBottom: 4,
          }}
        >
          Cảm ơn bạn đã thích! 🎉
        </p>
        <p style={{ fontSize: 12, color: "#6B6A64" }}>— {authorName}</p>
      </motion.div>
    </motion.div>
  );
}

export function PostReactions({
  postId,
  initialLiked,
  initialCount,
  initialSaved,
  isLoggedIn,
  authorName = "Tuấn Anh",
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [saved, setSaved] = useState(initialSaved);
  const [showPopover, setShowPopover] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const likeInFlight = useRef(false);
  const saveInFlight = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { open, close } = useModal();

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowMenu(false);
  };

  const openLogin = () => open(<LoginPopup onClose={close} />, { size: "sm" });

  const handleLike = async () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
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

      if (data.liked) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setShowPopover(true);
        timerRef.current = setTimeout(() => setShowPopover(false), 3000);
      } else {
        setShowPopover(false);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      likeInFlight.current = false;
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
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
    <div className="flex items-center justify-start gap-2 py-5 my-2 ">
      {/* Like — relative container for popover anchor */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-2.5 transition-colors cursor-pointer"
          style={{ color: liked ? "#e11d48" : "var(--muted)" }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1.5px solid ${liked ? "#e11d48" : "var(--border-color)"}`,
              transition: "border-color 0.15s ease",
              flexShrink: 0,
            }}
          >
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
              style={{ transition: "fill 0.15s ease" }}
            />
          </span>
          <span
            className="font-mono text-sm"
            style={{ color: liked ? "#e11d48" : "var(--muted)" }}
          >
            {count > 0 ? count : ""}
          </span>
        </button>

        <AnimatePresence>
          {showPopover && <LikePopover authorName={authorName} />}
        </AnimatePresence>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        className="flex items-center justify-center transition-colors cursor-pointer"
        style={{
          width: 36,
          height: 36,
          color: saved ? "var(--ink)" : "var(--muted)",
          flexShrink: 0,
        }}
      >
        {saved ? (
          <BookmarkCheck size={24} fill="currentColor" style={{ transition: "fill 0.15s ease" }} />
        ) : (
          <BookmarkPlus size={24} />
        )}
      </button>

      {/* Three dots */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setShowMenu((v) => !v)}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors cursor-pointer text-muted hover:text-ink"
        >
          <MoreHorizontal size={20} />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                right: 0,
                zIndex: 50,
                background: "#fff",
                borderRadius: 12,
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
                minWidth: 160,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-surface transition-colors cursor-pointer"
              >
                <Link2 size={15} className="text-muted shrink-0" />
                Sao chép liên kết
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
