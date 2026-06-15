const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include", // gửi cookie Auth.js sang Express
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
