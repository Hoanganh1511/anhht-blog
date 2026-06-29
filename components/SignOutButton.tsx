"use client";

import type { ReactNode } from "react";
import { getApiBase } from "@/lib/api";

interface Props {
  className?: string;
  children?: ReactNode;
  title?: string;
}

export function SignOutButton({ className, children, title }: Props) {
  async function handleSignOut() {
    await fetch(`${getApiBase()}/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  }

  return (
    <button onClick={handleSignOut} className={className} title={title}>
      {children ?? "Đăng xuất"}
    </button>
  );
}
