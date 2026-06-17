"use client";

import { useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import type { Block } from "@blocknote/core";

interface Props {
  initialContent?: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ initialContent, onChange }: Props) {
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0
      ? initialContent
      : undefined,
  });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    return editor.onChange(() => {
      onChangeRef.current(editor.document as Block[]);
    });
  }, [editor]);

  return (
    <div className="min-h-[400px] border border-line bg-paper">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
}
