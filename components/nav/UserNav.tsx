"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SignOutButton } from "@/components/SignOutButton";
import type { SessionUser } from "@/lib/session";

interface Props {
  user: SessionUser | null;
}

function IconAccount() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconCreative() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 12.5L4.5 10l7-7 2 2-7 7-2.5 2.5H2v-2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M11.5 3l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 14H2.5A1.5 1.5 0 0 1 1 12.5v-9A1.5 1.5 0 0 1 2.5 2H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 11l3-3-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const MENU_ITEMS = [
  { label: "Trung tâm tài khoản", href: "/account", icon: IconAccount },
  { label: "Trung tâm Sáng Tạo", href: "/admin", icon: IconCreative },
  { label: "Cài đặt", href: "/settings", icon: IconSettings },
];

export function UserNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="flex justify-end"
      >
        <Link
          href="/login"
          className="font-mono text-xs text-muted hover:text-ink transition-colors"
        >
          Đăng nhập
        </Link>
      </motion.div>
    );
  }

  const initial = (user.name ?? user.email)[0].toUpperCase();
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="flex justify-end"
    >
      <div ref={ref} className="relative">
        {/* Trigger: avatar + name */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 select-none cursor-pointer"
        >
          <motion.span
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="w-7 h-7 bg-ink text-paper font-mono text-xs font-semibold flex items-center justify-center shrink-0"
            title={user.email}
          >
            {initial}
          </motion.span>
          <span className="font-mono text-sm text-muted hidden lg:block truncate max-w-32">
            {displayName}
          </span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute right-0 top-[calc(100%+10px)] w-56 bg-surface border border-line z-50 py-1"
              style={{ transformOrigin: "top right" }}
            >
              {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-sm text-muted hover:text-ink hover:bg-ink/4 transition-colors"
                >
                  <Icon />
                  {label}
                </Link>
              ))}

              {/* divider */}
              <div className="my-1 border-t border-line" />

              <SignOutButton className="w-full flex items-center gap-2.5 px-4 py-2.5 font-mono text-sm text-muted hover:text-ink hover:bg-ink/4 transition-colors cursor-pointer">
                <IconSignOut />
                Đăng xuất
              </SignOutButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
