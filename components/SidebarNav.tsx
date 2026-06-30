"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  posts: { post: { id: string } }[];
}

const EXPLORE = [
  { label: "Mới nhất", href: "/latest" },
  { label: "Phổ biến", href: "/popular" },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="shrink-0"
    >
      <path d="M2 3.5l4 3 4-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

export function SidebarNav({ categories }: { categories: Category[] }) {
  const path = usePathname();

  const roots = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    roots.forEach((root) => {
      const children = categories.filter((c) => c.parentId === root.id);
      if (children.some((c) => path === `/category/${c.slug}`)) s.add(root.id);
    });
    return s;
  });

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Tất cả items đều dùng class này, không có -mx-6 — wrapper bên ngoài lo việc đó
  const cls = (active: boolean, large = false) =>
    [
      "flex w-full items-center gap-6px py-1 px-6 font-mono transition-colors",
      large ? "text-base" : "text-sm",
      active
        ? "text-ink hover:bg-ink/[0.05]"
        : "text-muted hover:bg-ink/[0.05] hover:text-ink",
    ].join(" ");

  return (
    <>
      {/* Khám phá */}
      <div>
        <p className="font-mono text-[0.7rem] uppercase tracking-[2px] text-muted mb-3">
          Khám phá
        </p>
        <nav className="-mx-6">
          {EXPLORE.map(({ label, href }) => (
            <Link key={href} href={href} className={cls(path === href, true)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Chủ đề */}
      <div>
        <p className="font-mono text-[0.7rem] uppercase tracking-[2px] text-muted mb-3">
          Chủ đề
        </p>
        <nav className="-mx-6">
          {roots.map((root) => {
            const rootHref = `/category/${root.slug}`;
            const children = childrenOf(root.id);
            const hasChildren = children.length > 0;
            const isOpen = openIds.has(root.id);

            return (
              <div key={root.id}>
                {hasChildren ? (
                  <button
                    onClick={() => toggle(root.id)}
                    className={`font-bold ${cls(false, true)}`}
                  >
                    {root.name}
                    <ChevronIcon open={isOpen} />
                  </button>
                ) : (
                  <Link href={rootHref} className={`font-bold ${cls(path === rootHref, true)}`}>
                    {root.name}
                  </Link>
                )}

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {children.map((child) => {
                        const href = `/category/${child.slug}`;
                        return (
                          <Link key={child.id} href={href} className={cls(path === href)}>
                            {child.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
