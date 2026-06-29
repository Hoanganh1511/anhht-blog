"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MobileHeaderLogo } from "./MobileHeaderLogo";
import { MobileMenu } from "./MobileMenu";
import type { SessionUser } from "@/lib/session";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const SCROLL_THRESHOLD = 110;

export function MobileHeaderShell({ user }: { user: SessionUser | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="flex md:hidden items-center justify-end relative"
      animate={{
        paddingTop: scrolled ? 17 : 8,
        paddingBottom: scrolled ? 17 : 8,
      }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <MobileHeaderLogo scrolled={scrolled} />
      <MobileMenu user={user} />
    </motion.div>
  );
}
