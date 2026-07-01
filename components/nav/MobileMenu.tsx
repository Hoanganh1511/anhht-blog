"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import type { SessionUser } from "@/lib/session";

const ARTICLES_ITEMS = [
  { label: "Tất cả bài viết", href: "/" },
  { label: "Lập trình", href: "/category/lap-trinh" },
];

interface Props {
  user: SessionUser | null;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const menuVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative w-5 h-14px">
      <motion.span
        className="absolute w-full h-px bg-ink left-0"
        style={{ top: 0 }}
        animate={{
          top: open ? "50%" : 0,
          rotate: open ? 45 : 0,
          translateY: open ? "-50%" : 0,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="absolute w-full h-px bg-ink left-0"
        style={{ top: "50%", translateY: "-50%" }}
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.span
        className="absolute w-full h-px bg-ink left-0"
        style={{ bottom: 0 }}
        animate={{
          bottom: open ? "50%" : 0,
          rotate: open ? -45 : 0,
          translateY: open ? "50%" : 0,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function MobileMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [articlesOpen, setArticlesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = () => {
    setOpen(false);
    setArticlesOpen(false);
  };

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="hidden"
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-paper z-60 flex flex-col"
        >
          {/* top bar mirrors header */}
          <div className="flex items-center justify-between h-14 px-4 border-b b-soft shrink-0">
            <span className="font-mono uppercase tracking-[3px] text-sm font-semibold">
              ANHHT BLOG_
            </span>
            <button onClick={close} className="p-2 -mr-2 cursor-pointer">
              <HamburgerIcon open={true} />
            </button>
          </div>

          {/* nav items */}
          <motion.nav
            variants={menuVariants}
            initial="hidden"
            animate="show"
            className="flex-1 flex flex-col px-6 pt-6 gap-1"
          >
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
            ].map((item) => (
              <motion.div key={item.href} variants={itemVariants}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="font-mono uppercase tracking-[1px] text-sm py-3 block border-b b-soft hover:text-accent-coral transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}

            {/* Articles accordion */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setArticlesOpen((v) => !v)}
                className="w-full flex items-center justify-between font-mono uppercase tracking-[1px] text-sm py-3 border-b b-soft cursor-pointer"
              >
                Articles
                <motion.svg
                  animate={{ rotate: articlesOpen ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2 4L7 10L12 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </button>

              <AnimatePresence initial={false}>
                {articlesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="pl-4 py-2 flex flex-col gap-1 border-b b-soft">
                      {ARTICLES_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={close}
                          className="font-mono text-sm text-muted hover:text-ink py-2 transition-colors"
                        >
                          → {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.nav>

          {/* user section at bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="border-t b-soft"
          >
            {user ? (
              <>
                {/* User identity row */}
                <div className="flex items-center gap-3 px-6 py-4">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? user.email}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-ink text-paper font-mono text-base font-semibold flex items-center justify-center shrink-0">
                      {(user.name ?? user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-ink truncate">
                      {user.name ?? user.email.split("@")[0]}
                    </p>
                    <p className="font-mono text-xs text-muted truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t b-soft pb-6">
                  <Link
                    href="/account"
                    onClick={close}
                    className="flex items-center gap-3 px-6 py-3 font-sans text-sm text-ink hover:bg-surface transition-colors"
                  >
                    <User size={16} className="text-muted shrink-0" />
                    Tài khoản
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={close}
                      className="flex items-center gap-3 px-6 py-3 font-sans text-sm text-ink hover:bg-surface transition-colors"
                    >
                      <LayoutDashboard
                        size={16}
                        className="text-muted shrink-0"
                      />
                      Trang quản trị
                    </Link>
                  )}
                  <SignOutButton className="w-full flex items-center gap-3 px-6 py-3 font-sans text-sm text-muted hover:bg-surface hover:text-ink transition-colors cursor-pointer">
                    <LogOut size={16} className="shrink-0" />
                    Đăng xuất
                  </SignOutButton>
                </div>
              </>
            ) : (
              <div className="px-6 py-5">
                <Link
                  href="/login"
                  onClick={close}
                  className="flex items-center justify-center w-full font-mono text-sm bg-ink text-paper rounded-sm py-3 hover:opacity-80 transition-opacity"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 -mr-2 cursor-pointer"
        aria-label={open ? "Đóng menu" : "Mở menu"}
      >
        <HamburgerIcon open={open} />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
