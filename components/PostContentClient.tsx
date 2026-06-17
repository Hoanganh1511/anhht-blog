"use client";

import dynamic from "next/dynamic";
import type { Block } from "@blocknote/core";

const PostContent = dynamic(
  () => import("@/components/PostContent").then((m) => m.PostContent),
  { ssr: false, loading: () => <div className="h-40 animate-pulse bg-surface" /> }
);

export function PostContentClient({ blocks }: { blocks: Block[] }) {
  return <PostContent blocks={blocks} />;
}
