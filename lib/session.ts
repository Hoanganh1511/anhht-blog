import { cookies } from "next/headers";
import { decode } from "@auth/core/jwt";

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: "USER" | "ADMIN";
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: COOKIE_NAME,
    });
    if (!payload?.sub && !payload?.id) return null;

    return {
      user: {
        id: (payload.id ?? payload.sub) as string,
        email: payload.email as string,
        name: payload.name as string | undefined,
        image: payload.picture as string | undefined,
        role: (payload.role as "USER" | "ADMIN") ?? "USER",
      },
    };
  } catch {
    return null;
  }
}
