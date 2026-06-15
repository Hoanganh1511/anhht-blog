import { serverFetch } from "@/lib/server-api";

export default async function AdminDashboard() {
  const res = await serverFetch("/admin/posts");
  const posts = res.ok ? await res.json() : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono uppercase tracking-[2px] text-lg">Bài viết</h1>
        <a
          href="/admin/posts/new"
          className="font-mono text-xs border border-line bg-ink text-paper px-4 py-2 hover:opacity-80 transition-opacity"
        >
          + Bài mới
        </a>
      </div>

      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left py-2 pr-4 font-mono text-xs text-muted uppercase tracking-wider">Tiêu đề</th>
            <th className="text-left py-2 pr-4 font-mono text-xs text-muted uppercase tracking-wider">Trạng thái</th>
            <th className="text-left py-2 pr-4 font-mono text-xs text-muted uppercase tracking-wider">Danh mục</th>
            <th className="text-left py-2 font-mono text-xs text-muted uppercase tracking-wider">Cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post: any) => (
            <tr key={post.id} className="border-b border-line hover:bg-surface">
              <td className="py-3 pr-4">
                <a href={`/admin/posts/${post.id}/edit`} className="hover:underline font-medium">
                  {post.title}
                </a>
              </td>
              <td className="py-3 pr-4">
                <span className={[
                  "font-mono text-xs px-2 py-0.5 border",
                  post.status === "PUBLISHED" ? "border-accent-blue text-accent-blue" : "border-muted text-muted",
                ].join(" ")}>
                  {post.status === "PUBLISHED" ? "Đã đăng" : "Nháp"}
                </span>
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-muted">
                {post.categories.map((c: any) => c.category.name).join(", ") || "—"}
              </td>
              <td className="py-3 font-mono text-xs text-muted">
                {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {posts.length === 0 && (
        <p className="font-mono text-xs text-muted mt-6">Chưa có bài viết nào.</p>
      )}
    </div>
  );
}
