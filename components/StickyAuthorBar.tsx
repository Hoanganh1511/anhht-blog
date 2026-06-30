"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useModal } from "@/lib/modal-context";
import { SignInButton } from "@/components/SignInButton";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold text-ink text-center mb-3">Đăng nhập</h2>
      <p className="text-sm text-muted text-center leading-relaxed mb-8">
        Đăng nhập để nhắn tin và
        <br />
        theo dõi nội dung mới.
      </p>

      {/* <p className="font-mono text-xs text-muted mb-3">Đăng nhập bằng</p> */}

      <SignInButton
        provider="google"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-line rounded-full hover:bg-surface transition-colors cursor-pointer mb-8"
      >
        <GoogleIcon />
        <span className="font-medium text-sm text-ink">
          Tiếp tục với Google
        </span>
      </SignInButton>

      <div className="border-t border-line/20 pt-5 text-center">
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-sm text-muted hover:text-ink transition-colors cursor-pointer"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}

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
    }
    // TODO: logged-in → navigate to messages
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-9999 bg-paper shadow-[0_1px_0_rgba(0,0,0,0.06)] transition-transform duration-200"
      style={{
        top: 0,
        transform: visible ? "translateY(0)" : "translateY(-110%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Left: avatar + name */}
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
          <span className="font-medium text-sm text-ink truncate">
            {authorName}
          </span>
        </div>

        {/* Right: action button */}
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
