"use client";

import { useState } from "react";

type Post = { id: string; title: string; slug: string; status: string };
type DayActivity = { date: string; count: number; posts: Post[] };

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function AdminActivity({ daily }: { daily: DayActivity[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (daily.length === 0) {
    return (
      <p className="font-mono text-xs text-muted">
        Chưa có hoạt động nào trong 30 ngày qua.
      </p>
    );
  }

  return (
    <div>
      {daily.map((day) => (
        <div
          key={day.date}
          className="relative flex items-center gap-4 py-2 px-3 -mx-3 rounded hover:bg-surface transition-colors cursor-default select-none"
          onMouseEnter={() => setHovered(day.date)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="font-mono text-xs text-muted w-20 shrink-0">
            {formatDate(day.date)}
          </span>

          <div className="flex items-center gap-1">
            {day.posts.map((_, i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-ink" style={{ opacity: 0.7 }} />
            ))}
          </div>

          <span className="font-mono text-xs text-muted">{day.count} bài</span>

          {hovered === day.date && (
            <div className="absolute left-36 top-full z-10 mt-1 bg-paper border border-line rounded shadow-md px-3 py-2 min-w-52 max-w-xs">
              {day.posts.map((post) => (
                <a
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center gap-1.5 font-mono text-xs text-ink hover:underline py-0.5"
                >
                  {post.status === "DRAFT" && (
                    <span className="text-muted shrink-0">[nháp]</span>
                  )}
                  <span className="truncate">{post.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
