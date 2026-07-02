"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Cảm xúc",
    emojis: [
      "😀", "😄", "😆", "😂", "🤣", "😊", "😍", "🥰",
      "😘", "😜", "🤔", "🤗", "🥹", "😢", "😭", "😤",
      "😅", "😬", "🙃", "😴", "🤯", "😱", "🥳", "😎",
    ],
  },
  {
    label: "Cử chỉ",
    emojis: [
      "👍", "👎", "👏", "🙌", "🤝", "🙏", "💪", "✌️",
      "👌", "🤞", "👀", "🫶", "✍️", "🤙", "👋", "🫡",
    ],
  },
  {
    label: "Yêu thích",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "💔", "💯", "🔥", "✨", "⭐", "🎉", "🎊", "💐",
    ],
  },
  {
    label: "Khác",
    emojis: [
      "☕", "🍀", "🌸", "🌈", "☀️", "🌙", "🍕", "🍜",
      "📚", "💻", "🚀", "🏆", "💡", "🎵", "📌", "✅",
    ],
  },
];

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 bg-paper border b-soft rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.14)] w-72 max-h-64 overflow-y-auto p-3"
      style={{ bottom: "calc(100% + 8px)", left: 0 }}
    >
      {EMOJI_GROUPS.map((group) => (
        <div key={group.label} className="mb-2">
          <p className="font-mono text-[11px] uppercase tracking-[1px] text-muted mb-1 px-1">
            {group.label}
          </p>
          <div className="grid grid-cols-8">
            {group.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="flex items-center justify-center w-8 h-8 text-lg rounded-sm hover:bg-surface transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
