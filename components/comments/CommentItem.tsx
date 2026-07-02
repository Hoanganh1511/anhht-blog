"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useModal } from "@/lib/modal-context";
import { CommentForm } from "./CommentForm";
import type { CommentData } from "./types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-bold text-ink text-center mb-3">Xóa bình luận?</h2>
      <p className="text-sm text-muted text-center leading-relaxed mb-6">
        Bình luận và các trả lời của nó sẽ bị xóa vĩnh viễn.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-sm text-muted hover:text-ink border b-soft rounded-sm px-5 py-2 bg-white transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="font-mono text-sm bg-ink text-paper rounded-sm px-5 py-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

interface Props {
  comment: CommentData;
  isReply?: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
  currentUserName?: string | null;
  currentUserImage?: string | null;
  onRequireLogin: () => void;
  onReply: (rootId: string, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CommentItem({
  comment,
  isReply = false,
  isLoggedIn,
  currentUserId,
  isAdmin,
  currentUserName,
  currentUserImage,
  onRequireLogin,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const [liked, setLiked] = useState(comment.likedByMe);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [showMenu, setShowMenu] = useState(false);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const likeInFlight = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { open, close } = useModal();

  const isAuthor = currentUserId === comment.user.id;
  const canDelete = isAuthor || isAdmin;
  const edited =
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 2000;
  // Reply của reply vẫn gắn về comment gốc (tối đa 1 cấp)
  const rootId = comment.parentId ?? comment.id;

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

  const handleLike = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (likeInFlight.current) return;

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    likeInFlight.current = true;

    try {
      const res = await apiFetch(`/comments/${comment.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      likeInFlight.current = false;
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    open(
      <DeleteConfirm
        onCancel={close}
        onConfirm={async () => {
          close();
          setDeleting(true);
          try {
            await onDelete(comment.id);
          } finally {
            setDeleting(false);
          }
        }}
      />,
      { size: "sm" },
    );
  };

  const userName = comment.user.name ?? "Ẩn danh";

  return (
    <div className={deleting ? "opacity-40 pointer-events-none" : ""}>
      <div className="flex items-start gap-3">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={userName}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface border b-soft shrink-0 flex items-center justify-center font-mono text-xs text-muted">
            {userName[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-ink">{userName}</span>
            <span className="font-mono text-[11px] text-muted">
              {timeAgo(comment.createdAt)}
              {edited && " · đã chỉnh sửa"}
            </span>

            <div className="flex-1" />

            {canDelete && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="Tùy chọn"
                  className="flex items-center justify-center w-7 h-7 rounded-sm text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  <MoreHorizontal size={16} />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 bg-paper border b-soft rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.14)] min-w-36 overflow-hidden"
                      style={{ top: "calc(100% + 4px)" }}
                    >
                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setEditing(true);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface transition-colors cursor-pointer"
                        >
                          <Pencil size={14} className="text-muted shrink-0" />
                          Chỉnh sửa
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="text-muted shrink-0" />
                          Xóa
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <CommentForm
                isLoggedIn={isLoggedIn}
                onRequireLogin={onRequireLogin}
                initialValue={comment.content}
                submitLabel="Lưu"
                autoFocus
                compact
                onCancel={() => setEditing(false)}
                onSubmit={async (content) => {
                  await onEdit(comment.id, content);
                  setEditing(false);
                }}
              />
            </div>
          ) : (
            <p className="font-sans text-sm text-ink leading-relaxed mt-1 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {!editing && (
            <div className="flex items-center gap-4 mt-1">
              <button
                type="button"
                onClick={handleLike}
                className="flex items-center gap-1 font-mono text-xs transition-colors cursor-pointer"
                style={{ color: liked ? "#e11d48" : "var(--muted)" }}
              >
                <Heart size={14} fill={liked ? "currentColor" : "none"} />
                {likesCount > 0 ? likesCount : ""}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    onRequireLogin();
                    return;
                  }
                  setReplying((v) => !v);
                }}
                className="font-mono text-xs text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Trả lời
              </button>
            </div>
          )}

          {replying && (
            <div className="mt-3">
              <CommentForm
                isLoggedIn={isLoggedIn}
                onRequireLogin={onRequireLogin}
                userName={currentUserName}
                userImage={currentUserImage}
                placeholder={`Trả lời ${userName}...`}
                submitLabel="Trả lời"
                autoFocus
                compact
                onCancel={() => setReplying(false)}
                onSubmit={async (content) => {
                  await onReply(rootId, content);
                  setReplying(false);
                }}
              />
            </div>
          )}

          {/* Replies — 1 cấp */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l b-soft flex flex-col gap-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply
                  isLoggedIn={isLoggedIn}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  currentUserName={currentUserName}
                  currentUserImage={currentUserImage}
                  onRequireLogin={onRequireLogin}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
