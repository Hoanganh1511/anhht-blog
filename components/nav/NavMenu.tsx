"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NavDropdown } from "./NavDropdown";
import type { DropdownItem } from "./NavDropdown";

const ARTICLES_ITEMS: DropdownItem[] = [
  { label: "Tất cả bài viết", href: "/" },
  { label: "Lập trình", href: "/category/lap-trinh" },
];

interface NavItem {
  id: string;
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "articles", label: "Articles", dropdown: ARTICLES_ITEMS },
];

export function NavMenu() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-9">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href ? pathname === item.href : false;

        if (item.dropdown) {
          return (
            <div key={item.id} className="relative py-1">
              <NavDropdown label={item.label} items={item.dropdown} />
            </div>
          );
        }

        return (
          <div
            key={item.id}
            className="relative py-1"
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              href={item.href!}
              className="font-mono text-sm uppercase tracking-[1px] text-ink transition-colors"
            >
              {item.label}
            </Link>

            {/* sliding underline on hover */}
            {hovered === item.id && (
              <motion.div
                layoutId="nav-underline"
                className="absolute bottom-0 left-0 right-0 h-px bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* active indicator (coral, shown when not hovering) */}
            {isActive && hovered !== item.id && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-accent-coral" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
