"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LOGO_TEXT = "ANHHT BLOG";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function MobileHeaderLogo({ scrolled }: { scrolled: boolean }) {
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    if (!scrolled) {
      setBouncing(false);
      return;
    }

    const runCycle = () => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 1400);
    };

    const first = setTimeout(runCycle, 300);
    const interval = setInterval(runCycle, 3800);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [scrolled]);

  return (
    <motion.div
      className="absolute"
      animate={{
        left: scrolled ? "50%" : "0%",
        x: scrolled ? "-50%" : "0%",
        scale: scrolled ? 1.08 : 1,
      }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <Link href="/" className="flex items-baseline select-none">
        <span className="font-mono uppercase tracking-[2px] text-sm font-semibold flex items-baseline">
          {LOGO_TEXT.split("").map((char, i) =>
            char === " " ? (
              <span key={i} className="w-[0.5em]" />
            ) : (
              <motion.span
                key={i}
                className="inline-block"
                animate={{ y: bouncing ? [0, -5, 0] : 0 }}
                transition={{
                  duration: bouncing ? 0.38 : 0.15,
                  delay: bouncing ? i * 0.07 : 0,
                  ease: "easeInOut",
                }}
              >
                {char}
              </motion.span>
            )
          )}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
            className="ml-0.5 text-accent-coral"
          >
            _
          </motion.span>
        </span>
      </Link>
    </motion.div>
  );
}
