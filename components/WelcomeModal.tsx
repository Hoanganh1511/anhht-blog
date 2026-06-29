"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useModal } from "@/lib/modal-context";

const STORAGE_KEY = "anhht_welcomed_v1";
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SparkleProps {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  delay: number;
}

function Sparkle({ top, left, right, bottom, size, delay }: SparkleProps) {
  return (
    <motion.span
      className="absolute font-mono select-none pointer-events-none leading-none"
      style={{ top, left, right, bottom, fontSize: size + "px", color: "#C8C8C8" }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45, ease }}
    >
      +
    </motion.span>
  );
}

function WelcomeContent({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">

      {/* Circle illustration */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, scale: 0.55 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        style={{ width: "80px", height: "80px" }}
      >
        {/* Sparkles */}
        <Sparkle top="-12px" left="-2px"    size={18} delay={0.52} />
        <Sparkle top="-16px" right="10px"   size={12} delay={0.64} />
        <Sparkle top="8px"   right="-20px"  size={20} delay={0.7}  />
        <Sparkle bottom="0"  right="-12px"  size={11} delay={0.78} />
        <Sparkle top="45%"   left="-22px"   size={15} delay={0.6}  />
        <Sparkle bottom="6px" left="-4px"   size={10} delay={0.82} />

        {/* Main circle */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#1A1A1A" }}
        >
          <span
            className="font-mono select-none"
            style={{ fontSize: "32px", color: "#FFFFFF", lineHeight: 1 }}
          >
            ✦
          </span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="font-mono font-bold text-base text-ink mb-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay: 0.38 }}
      >
        Xin chào, mình là Tuấn Anh!
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-sm text-muted leading-relaxed mb-8 px-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay: 0.5 }}
      >
        Blog về frontend engineering, design, và những thứ mình thấy thú vị.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay: 0.62 }}
      >
        <motion.button
          type="button"
          onClick={onExplore}
          className="border b-soft rounded-full font-mono text-sm text-ink px-8 py-2 transition-colors cursor-pointer btn-primary-hover"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          Khám phá ngay
        </motion.button>
      </motion.div>

    </div>
  );
}

export function WelcomeModalTrigger() {
  const { open, close, isOpen } = useModal();
  const wasOpened = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // TODO: re-enable localStorage check after testing
    // if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      wasOpened.current = true;
      open(<WelcomeContent onExplore={close} />, { size: "sm" });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark welcomed on any close (X button or CTA)
  useEffect(() => {
    if (wasOpened.current && !isOpen) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }, [isOpen]);

  return null;
}
