"use client";

import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/posts", label: "Bài viết", exact: false },
  { href: "/admin/categories", label: "Danh mục", exact: false },
  { href: "/admin/media", label: "Media", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-44 shrink-0 sticky top-8">
      <span className="font-mono uppercase tracking-[2px] text-xs text-muted mb-5 block px-4">
        Admin
      </span>
      <div className="flex flex-col">
        {NAV_LINKS.map(({ href, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <a
              key={href}
              href={href}
              className={[
                "font-mono text-sm py-1.5 px-4 transition-colors border-l-2",
                isActive
                  ? "border-ink text-ink font-medium"
                  : "border-transparent text-muted hover:text-ink",
              ].join(" ")}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
