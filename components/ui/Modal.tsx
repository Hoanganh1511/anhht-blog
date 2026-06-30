"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
}

const widths: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

function CloseIcon() {
  return (
    <motion.svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      whileHover={{ rotate: 90 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
    >
      <path
        d="M1 1l9 9M10 1L1 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const closeBtn = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Đóng"
      className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink rounded-sm btn-ghost-hover transition-colors shrink-0"
    >
      <CloseIcon />
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-100 flex items-center justify-center px-4 modal-overlay"
          style={{ backgroundColor: "rgba(10, 10, 10, 0.5)" }}
          onClick={onClose}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
            className={`bg-paper w-full ${widths[size]} rounded-lg shadow-[0_8px_40px_rgba(0,0,0,0.18)] border b-soft`}
            style={{ willChange: "transform, opacity" }}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              /* ── titled modal ── */
              <>
                {/* Centered title — spacer div mirrors close button width so title is truly centered */}
                <div className="flex items-center px-4 pt-5 pb-4 border-b b-soft">
                  <div className="w-8 shrink-0" />
                  <h2 className="flex-1 text-center font-mono text-sm font-semibold text-ink">
                    {title}
                  </h2>
                  {closeBtn}
                </div>
                <div className="px-6 py-5">{children}</div>
              </>
            ) : (
              /* ── no-title modal: close btn in-flow (top-right via flex) ── */
              <>
                <div className="flex justify-end px-4 pt-4">
                  {closeBtn}
                </div>
                <div className="px-8 pt-4 pb-8">{children}</div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
