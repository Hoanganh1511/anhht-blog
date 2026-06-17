import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex">
      <nav className="w-48 border-r border-line bg-paper p-4 flex flex-col gap-1 shrink-0">
        <span className="font-mono uppercase tracking-[2px] text-xs text-muted mb-4 block">
          Admin
        </span>
        <a href="/admin" className="font-mono text-sm py-1 hover:text-ink text-muted transition-colors">
          Dashboard
        </a>
        <a href="/admin/posts/new" className="font-mono text-sm py-1 hover:text-ink text-muted transition-colors">
          Bài mới
        </a>
        <a href="/admin/media" className="font-mono text-sm py-1 hover:text-ink text-muted transition-colors">
          Media
        </a>
        <hr className="border-line my-2" />
        <a href="/" className="font-mono text-xs text-muted hover:text-ink transition-colors">
          ← Về trang chủ
        </a>
      </nav>
      <main className="flex-1 p-8 bg-paper">{children}</main>
    </div>
  );
}
