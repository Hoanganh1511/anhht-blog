"use client";

import { useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import type { Block } from "@blocknote/core";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostContent({ blocks }: { blocks: Block[] }) {
  const editor = useCreateBlockNote({
    initialContent: blocks.length > 0 ? blocks : undefined,
  });

  useEffect(() => {
    const container = document.querySelector(".bn-readonly");
    if (!container) return;
    const headings = container.querySelectorAll("h1,h2,h3,h4,h5,h6");
    headings.forEach((el) => {
      const text = el.textContent?.trim() ?? "";
      if (text) el.id = slugify(text);
    });
  }, []);

  return (
    <div className="bn-readonly">
      <BlockNoteView editor={editor} editable={false} theme="light" />
    </div>
  );
}
