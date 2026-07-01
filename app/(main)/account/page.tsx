import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { serverFetch } from "@/lib/server-api";
import { AccountGrid, AccountDesktop } from "./AccountForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tài khoản" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const res = await serverFetch("/users/me");
  if (!res.ok) redirect("/login");
  const user = await res.json();

  const joinDate = new Date(user.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-xl mx-auto px-4 pt-6 md:pt-10 pb-16">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-ink mb-1">Tài khoản</h1>
        <p className="font-mono text-sm text-muted">Tham gia từ {joinDate}</p>
      </div>

      <div className="border-t border-line-primary pt-8">
        {/* Mobile: grid of links */}
        <div className="md:hidden">
          <AccountGrid />
        </div>

        {/* Desktop: sidebar + inline content */}
        <div className="hidden md:block">
          <AccountDesktop user={user} />
        </div>
      </div>
    </main>
  );
}
