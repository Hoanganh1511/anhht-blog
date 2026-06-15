import { decode } from "@auth/core/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function proxy(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const payload = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: COOKIE_NAME,
    });
    if (payload?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
