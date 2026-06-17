"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function MobileCategoryBar({ categories }: { categories: Category[] }) {
  const path = usePathname();

  const items = [
    { id: "_all", name: "Tất cả", href: "/" },
    ...categories.map((c) => ({ id: c.id, name: c.name, href: `/category/${c.slug}` })),
  ];

  return (
    <div className="md:hidden flex items-center gap-6 overflow-x-auto px-4 py-2.5 no-scrollbar">
      {items.map((item) => {
        const active = path === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`font-mono text-[10px] uppercase tracking-[2px] shrink-0 pb-0.5 transition-colors ${
              active ? "text-ink border-b border-ink" : "text-muted hover:text-ink"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
