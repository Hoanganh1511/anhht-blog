"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useModal } from "@/lib/modal-context";
import { LoginPopup } from "@/components/LoginPopup";

interface Props {
  authorName: string;
  authorImage?: string | null;
  isLoggedIn: boolean;
}

export function StickyAuthorBar({ authorName, authorImage, isLoggedIn }: Props) {
  const [visible, setVisible] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { open, close } = useModal();

  useEffect(() => {
    const sentinel = document.getElementById("post-header-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleMessage = () => {
    if (!isLoggedIn) {
      open(<LoginPopup onClose={close} />, { size: "sm" });
      return;
    }
    // TODO: logged-in → navigate to messages
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-9999 bg-paper shadow-[0_1px_0_rgba(0,0,0,0.06)] transition-transform duration-200"
      style={{ top: 0, transform: visible ? "translateY(0)" : "translateY(-110%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {authorImage ? (
            <Image
              src={authorImage}
              alt={authorName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface border border-line shrink-0 flex items-center justify-center font-mono text-xs text-muted">
              {authorName[0]?.toUpperCase()}
            </div>
          )}
          <span className="font-medium text-sm text-ink truncate">{authorName}</span>
        </div>

        <button
          type="button"
          onClick={handleMessage}
          className="shrink-0 flex items-center gap-1.5 font-mono text-sm font-medium border border-line rounded-sm px-3.5 py-1.5 text-ink hover:bg-surface transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Nhắn tin
        </button>
      </div>
    </div>,
    document.body,
  );
}
