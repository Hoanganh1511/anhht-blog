import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminNavMobile, AdminNavDesktop } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="flex-1" style={{ backgroundColor: "#F7F7F7" }}>
      {/* Mobile tab bar — sits above content */}
      <AdminNavMobile />

      {/* Content area */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8 flex gap-6 items-start">
        <AdminNavDesktop />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
