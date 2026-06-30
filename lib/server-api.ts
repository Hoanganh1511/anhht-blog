import { cookies } from "next/headers";

const API = process.env.API_URL ?? "http://localhost:4000";
const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

// Server-side fetch — forward cookie, never throws (caller checks res.ok)
export async function serverFetchRaw(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `${COOKIE_NAME}=${token}` } : {}),
      ...init?.headers,
    },
  });
}

// Server-side fetch đến Express — tự forward cookie session
export async function serverFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `${COOKIE_NAME}=${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res;
}
