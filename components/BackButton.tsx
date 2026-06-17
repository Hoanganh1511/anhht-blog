"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.back()}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 font-mono text-xs text-muted cursor-pointer mb-10"
    >
      <motion.span
        variants={{ rest: { x: 0 }, hover: { x: -4 } }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        ←
      </motion.span>
      <motion.span
        variants={{ rest: { color: "var(--muted)" }, hover: { color: "var(--ink)" } }}
        transition={{ duration: 0.15 }}
      >
        Quay lại
      </motion.span>
    </motion.button>
  );
}
