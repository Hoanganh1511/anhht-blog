"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import type { Block } from "@blocknote/core";

export function PostContent({ blocks }: { blocks: Block[] }) {
  const editor = useCreateBlockNote({
    initialContent: blocks.length > 0 ? blocks : undefined,
  });

  return (
    <div className="-mx-[54px]">
      <BlockNoteView editor={editor} editable={false} theme="light" />
    </div>
  );
}
