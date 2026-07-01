import { serverFetch } from "@/lib/server-api";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const metadata = { title: "Bài viết — Admin" };

export default async function AdminPostsPage() {
  const res = await serverFetch("/admin/posts");
  const posts: any[] = res.ok ? await res.json() : [];

  return (
    <div className="bg-paper rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-4">
        <h1 className="font-mono uppercase tracking-[2px] text-lg">Bài viết</h1>
        <a
          href="/admin/posts/new"
          className="font-mono text-xs border border-line bg-ink text-paper rounded-sm px-4 py-2 hover:opacity-80 transition-opacity"
        >
          + Bài mới
        </a>
      </div>

      {/* Count bar */}
      <div className="px-6 pb-3">
        <span className="font-mono text-xs text-muted">
          {posts.length} bài viết
        </span>
      </div>

      {/* Post list — rows extend edge-to-edge */}
      {posts.length === 0 && (
        <p className="font-mono text-xs text-muted px-6 py-10 text-center">
          Chưa có bài viết nào.
        </p>
      )}
      {posts.map((post, i) => (
        <div
          key={post.id}
          className={`flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-surface transition-colors${
            i !== posts.length - 1 ? " border-b" : " mb-2"
          }`}
          style={
            i !== posts.length - 1 ? { borderColor: "#EBEBEB" } : undefined
          }
        >
          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <a
              href={`/admin/posts/${post.id}/edit`}
              className="font-medium text-sm text-ink hover:underline line-clamp-2 leading-snug"
            >
              {post.title || (
                <span className="text-muted italic">Chưa có tiêu đề</span>
              )}
            </a>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    post.status === "PUBLISHED" ? "#22c55e" : "#9ca3af",
                }}
              />
              <span className="font-mono text-xs text-muted">
                {post.status === "PUBLISHED" ? "Đã đăng" : "Nháp"}
                {" · "}
                {post.categories.map((c: any) => c.category.name).join(", ") ||
                  "—"}
                {" · "}
                {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Cover thumbnail */}
          {post.coverImage && (
            <div
              className="w-14 h-10 rounded overflow-hidden shrink-0 bg-surface"
              style={{
                backgroundImage: `url(${post.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          {/* Actions */}
          <div className="flex items-center shrink-0">
            <a
              href={`/admin/posts/${post.id}/edit`}
              className="font-mono text-xs text-muted hover:text-ink underline transition-colors px-2"
            >
              Sửa
            </a>
            <DeletePostButton postId={post.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
