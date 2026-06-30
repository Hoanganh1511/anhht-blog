import { serverFetch } from "@/lib/server-api";
import { AdminActivity } from "@/components/admin/AdminActivity";

export const metadata = { title: "Dashboard — Admin" };

interface Stats {
  total: number;
  published: number;
  draft: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  daily: { date: string; count: number; posts: { id: string; title: string; slug: string; status: string }[] }[];
}

const STAT_CARDS = [
  { label: "Tổng bài", key: "total" },
  { label: "Đã đăng", key: "published" },
  { label: "Tháng này", key: "thisMonth" },
  { label: "Tuần này", key: "thisWeek" },
] as const;

export default async function AdminDashboardPage() {
  const res = await serverFetch("/admin/stats");
  const stats: Stats = res.ok
    ? await res.json()
    : { total: 0, published: 0, draft: 0, thisMonth: 0, thisWeek: 0, today: 0, daily: [] };

  return (
    <div className="bg-paper rounded px-6 py-6">
      <h1 className="font-mono uppercase tracking-[2px] text-lg mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {STAT_CARDS.map(({ label, key }) => (
          <div key={key} className="rounded p-4" style={{ backgroundColor: "#F7F7F7" }}>
            <div className="font-mono text-3xl font-bold text-ink mb-1">
              {stats[key]}
            </div>
            <div className="font-mono text-xs text-muted uppercase tracking-wider">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div>
        <h2 className="font-mono text-xs text-muted uppercase tracking-wider mb-4">
          Hoạt động 30 ngày qua
        </h2>
        <AdminActivity daily={stats.daily} />
      </div>
    </div>
  );
}
