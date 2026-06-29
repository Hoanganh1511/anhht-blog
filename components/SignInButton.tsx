"use client";

import { getApiBase } from "@/lib/api";

interface Props {
  provider: "google" | "github";
  children: React.ReactNode;
  className?: string;
}

export function SignInButton({ provider, children, className }: Props) {
  async function handleSignIn() {
    const api = getApiBase();

    // Bước 1: Lấy CSRF token từ Express (Auth.js yêu cầu)
    const csrfRes = await fetch(`${api}/auth/csrf`, { credentials: "include" });
    const { csrfToken } = await csrfRes.json();

    // Bước 2: POST form đến /auth/signin/:provider
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${api}/auth/signin/${provider}`;

    const fields = {
      csrfToken,
      callbackUrl: window.location.origin,
    };

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  return (
    <button onClick={handleSignIn} className={className}>
      {children}
    </button>
  );
}
