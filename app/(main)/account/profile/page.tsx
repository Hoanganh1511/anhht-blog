import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { serverFetch } from "@/lib/server-api";
import { ProfileTab } from "../AccountForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Thông tin cơ bản" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const res = await serverFetch("/users/me");
  if (!res.ok) redirect("/login");
  const user = await res.json();

  return (
    <main className="max-w-xl mx-auto px-4 pt-4 pb-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 font-mono text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Tài khoản
      </Link>

      <h1 className="font-sans text-xl font-bold text-ink mb-8">Thông tin cơ bản</h1>

      <ProfileTab user={user} />
    </main>
  );
}
