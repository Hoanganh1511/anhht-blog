"use client";

interface Props {
  provider: "google" | "github";
  children: React.ReactNode;
  className?: string;
}

export function SignInButton({ provider, children, className }: Props) {
  async function handleSignIn() {
    // Dùng path tương đối /auth/* (proxied qua Next.js) để cookie gắn đúng domain
    const csrfRes = await fetch("/auth/csrf", { credentials: "include" });
    const { csrfToken } = await csrfRes.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/auth/signin/${provider}`;

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
