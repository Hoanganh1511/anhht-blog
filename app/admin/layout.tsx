import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="flex-1" style={{ backgroundColor: "#F7F7F7", zoom: 1.1 }}>
      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6 items-start">
        <AdminNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
