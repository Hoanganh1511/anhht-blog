"use client";

import { useEffect } from "react";

const HIDE_AFTER = 180;
const SHOW_BEFORE = 50;

export function HeaderController() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header");
    if (header) {
      header.style.transition = "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";
    }

    const onScroll = () => {
      const y = window.scrollY;
      const el = document.querySelector<HTMLElement>("header");
      if (!el) return;

      if (y > HIDE_AFTER) {
        el.style.transform = "translateY(-100%)";
      } else if (y < SHOW_BEFORE) {
        el.style.transform = "";
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
