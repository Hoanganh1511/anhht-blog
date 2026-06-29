"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface DropdownItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scaleY: 0.92 },
  show: { opacity: 1, y: 0, scaleY: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0 },
};

export function NavDropdown({ label, items, className }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  return (
    <div
      className={`relative ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center gap-6px font-mono text-sm uppercase tracking-[1px] cursor-pointer select-none outline-none">
        {label}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M1 2.5L4.5 6.5L8 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-surface border b-soft min-w-[160px] py-6px z-50"
          >
            {/* top pointer */}
            <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-10px h-10px border-l border-t b-soft bg-surface rotate-45" />

            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } } }}
              initial="hidden"
              animate="show"
            >
              {items.map((item) => (
                <motion.div key={item.href} variants={itemVariants} transition={{ duration: 0.15 }}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2 font-mono text-[11px] text-muted hover:text-ink hover:bg-paper transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
