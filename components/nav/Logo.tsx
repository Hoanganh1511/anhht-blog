"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const LOGO_TEXT = "ANHHT BLOG";

const containerVariants = {
  rest: { transition: { staggerChildren: 0 } },
  hover: { transition: { staggerChildren: 0.04, delayChildren: 0 } },
};

const letterVariants = {
  rest: { y: 0 },
  hover: {
    y: -3,
    transition: { type: "spring" as const, stiffness: 700, damping: 20 },
  },
};

export function Logo() {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      variants={containerVariants}
      className="w-fit"
    >
      <Link href="/" className="flex items-baseline select-none">
        <span className="font-mono uppercase tracking-[3px] text-lg font-semibold flex items-baseline">
          {LOGO_TEXT.split("").map((char, i) =>
            char === " " ? (
              <span key={i} className="w-[0.5em]" />
            ) : (
              <motion.span key={i} variants={letterVariants} className="inline-block">
                {char}
              </motion.span>
            )
          )}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
            className="ml-[2px] text-accent-coral"
          >
            _
          </motion.span>
        </span>
      </Link>
    </motion.div>
  );
}
