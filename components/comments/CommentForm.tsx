"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";

export const COMMENT_MAX_LENGTH = 500;

interface Props {
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  onSubmit: (content: string) => Promise<void>;
  userName?: string | null;
  userImage?: string | null;
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onCancel?: () => void;
}

export function CommentForm({
  isLoggedIn,
  onRequireLogin,
  onSubmit,
  userName,
  userImage,
  placeholder = "Viết bình luận...",
  submitLabel = "Gửi",
  initialValue = "",
  autoFocus = false,
  compact = false,
  onCancel,
}: Props) {
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH && !submitting;

  const guardLogin = () => {
    if (isLoggedIn) return true;
    onRequireLogin();
    return false;
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((c) => (c + emoji).slice(0, COMMENT_MAX_LENGTH));
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = (content.slice(0, start) + emoji + content.slice(end)).slice(
      0,
      COMMENT_MAX_LENGTH,
    );
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.min(start + emoji.length, next.length);
      el.setSelectionRange(pos, pos);
      autoResize(el);
    });
  };

  const handleSubmit = async () => {
    if (!guardLogin() || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setContent("");
      setShowPicker(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={compact ? "" : "flex items-start gap-3"}>
      {!compact &&
        (userImage ? (
          <Image
            src={userImage}
            alt={userName ?? "Bạn"}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface border b-soft shrink-0 mt-1 flex items-center justify-center font-mono text-xs text-muted">
            {(userName ?? "?")[0]?.toUpperCase()}
          </div>
        ))}

      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value.slice(0, COMMENT_MAX_LENGTH));
            autoResize(e.target);
          }}
          onFocus={() => {
            if (!isLoggedIn) {
              textareaRef.current?.blur();
              onRequireLogin();
            }
          }}
          placeholder={placeholder}
          maxLength={COMMENT_MAX_LENGTH}
          rows={compact ? 2 : 3}
          autoFocus={autoFocus}
          className="w-full font-sans text-sm text-ink rounded-sm border b-soft bg-surface px-3 py-2 focus:outline-none focus:border-ink transition-colors resize-none placeholder:text-muted"
        />

        <div className="flex items-center gap-2 mt-1">
          {/* Emoji picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (guardLogin()) setShowPicker((v) => !v);
              }}
              aria-label="Chèn emoji"
              className="flex items-center justify-center w-8 h-8 rounded-sm text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
            >
              <Smile size={18} />
            </button>
            <AnimatePresence>
              {showPicker && (
                <EmojiPicker onSelect={insertEmoji} onClose={() => setShowPicker(false)} />
              )}
            </AnimatePresence>
          </div>

          <span className="font-mono text-[11px] text-muted">
            {content.length}/{COMMENT_MAX_LENGTH}
          </span>

          <div className="flex-1" />

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="font-mono text-sm text-muted hover:text-ink border b-soft rounded-sm px-4 py-1 bg-white transition-colors cursor-pointer"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="font-mono text-sm bg-ink text-paper rounded-sm px-4 py-1 hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            {submitting ? "Đang gửi..." : submitLabel}
          </button>
        </div>

        {error && (
          <p className="font-mono text-xs text-accent-coral mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
