"use client";

import { useState } from "react";

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ headings }: { headings: HeadingItem[] }) {
  const [open, setOpen] = useState(true);

  if (!headings.length) return null;

  return (
    <div className="mb-8 rounded-sm overflow-hidden" style={{ backgroundColor: "#F7F7F7" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left"
      >
        <span
          className="text-[10px] text-muted transition-transform duration-200"
          style={{ display: "inline-block", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          ▼
        </span>
        <span className="font-mono text-sm font-medium text-ink">Mục lục</span>
      </button>

      {open && (
        <div>
          {headings.map((h, i) => (
            <a
              key={i}
              href={`#${h.id}`}
              className="flex items-center border-t border-line/10 px-4 py-2.5 text-sm text-ink hover:bg-white transition-colors"
              style={{ paddingLeft: h.level >= 3 ? 32 : 16 }}
            >
              {h.level >= 3 && (
                <span className="text-muted text-xs mr-2">└</span>
              )}
              {h.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
