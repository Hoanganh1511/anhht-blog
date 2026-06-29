"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.15 }}
      className="shrink-0"
    >
      <path
        d="M2 3.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="shrink-0 text-muted"
    >
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9.5 9.5L12 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PopoverState {
  parentId: string;
  left: number;
  top: number;
}

export function MobileCategoryBar({ categories }: { categories: Category[] }) {
  const path = usePathname();
  const router = useRouter();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [query, setQuery] = useState("");

  const roots = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) =>
    categories.filter((c) => c.parentId === id);

  useEffect(() => {
    if (!popover) return;
    const close = () => setPopover(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [popover]);

  useEffect(() => {
    setPopover(null);
  }, [path]);

  const togglePopover = (
    e: React.MouseEvent<HTMLButtonElement>,
    parentId: string,
  ) => {
    e.stopPropagation();
    if (popover?.parentId === parentId) {
      setPopover(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ parentId, left: rect.left, top: rect.bottom + 8 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const isAllActive = path === "/";

  return (
    <>
      <div className="md:hidden">
        {/* Search */}
        <form onSubmit={handleSearch} className="px-4 pt-2 pb-12px">
          <div className="flex items-center gap-2 border b-soft rounded-lg px-3 py-2">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bài viết..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted/40 outline-none"
            />
          </div>
        </form>

        {/* Tab bar */}
        <div className="flex items-end gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
          <TabItem active={isAllActive}>
            <Link href="/" className="block">
              Tất cả
            </Link>
          </TabItem>

          {roots.map((root) => {
            const children = childrenOf(root.id);
            const hasChildren = children.length > 0;
            const isRootPage = path === `/category/${root.slug}`;
            const hasActiveChild = children.some(
              (c) => path === `/category/${c.slug}`,
            );
            const isOpen = popover?.parentId === root.id;
            const active = isRootPage || hasActiveChild;

            if (!hasChildren) {
              return (
                <TabItem key={root.id} active={active}>
                  <Link href={`/category/${root.slug}`} className="block">
                    {root.name}
                  </Link>
                </TabItem>
              );
            }

            return (
              <TabItem key={root.id} active={active} dim={isOpen && !active}>
                <button
                  type="button"
                  onClick={(e) => togglePopover(e, root.id)}
                  className="flex items-center gap-1"
                >
                  {root.name}
                  <ChevronIcon open={isOpen} />
                </button>
              </TabItem>
            );
          })}
        </div>
      </div>

      {/* Popover */}
      <AnimatePresence>
        {popover && (
          <motion.div
            key={popover.parentId}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 bg-paper rounded-xl shadow-xl overflow-hidden py-6px min-w-144px"
            style={{ left: popover.left, top: popover.top }}
          >
            {childrenOf(popover.parentId).map((child) => {
              const active = path === `/category/${child.slug}`;
              return (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  onClick={() => setPopover(null)}
                  className={`flex items-center gap-10px px-4 py-10px text-sm transition-colors ${
                    active
                      ? "text-ink font-bold"
                      : "text-muted/60 font-medium hover:text-ink"
                  }`}
                >
                  {active && (
                    <span className="w-1 h-1 rounded-full bg-ink shrink-0" />
                  )}
                  {child.name}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TabItem({
  active,
  dim,
  children,
}: {
  active: boolean;
  dim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "shrink-0 whitespace-nowrap text-sm transition-colors rounded-full px-3 py-1 border",
        active
          ? "text-ink font-bold b-soft"
          : dim
            ? "text-ink/60 font-semibold b-soft"
            : "text-muted/50 font-semibold b-soft hover:text-ink/70",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
