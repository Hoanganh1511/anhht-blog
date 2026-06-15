import { getSession } from "@/lib/session";
import { serverFetch } from "@/lib/server-api";
import { SignOutButton } from "@/components/SignOutButton";

export default async function HomePage() {
  const session = await getSession();
  const res = await serverFetch("/categories");
  const categories = res.ok ? await res.json() : [];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12 border-b border-line pb-6 flex items-center justify-between">
        <h1 className="font-mono uppercase tracking-[2px] text-2xl">anhht blog</h1>

        <div className="flex items-center gap-4 font-mono text-xs">
          {session ? (
            <>
              <span className="text-muted">{session.user?.email}</span>
              {session.user?.role === "ADMIN" && (
                <a href="/admin" className="hover:text-accent-blue transition-colors">Admin</a>
              )}
              <SignOutButton className="text-muted hover:text-ink transition-colors font-mono text-xs" />
            </>
          ) : (
            <a href="/login" className="hover:text-accent-blue transition-colors">Đăng nhập</a>
          )}
        </div>
      </header>

      {categories.length === 0 && (
        <p className="font-mono text-muted text-sm">Chưa có bài viết nào.</p>
      )}

      {categories.map((cat: any) => (
        <section key={cat.id} className="mb-16">
          <div className="flex items-center justify-between mb-4 border-b border-line pb-2">
            <h2 className="font-mono uppercase tracking-[2px] text-sm">{cat.name}</h2>
            <a href={`/category/${cat.slug}`} className="font-mono text-xs text-muted hover:text-ink transition-colors">
              Xem tất cả →
            </a>
          </div>

          <div className="grid grid-cols-4 auto-rows-[128px] gap-3">
            {cat.posts.slice(0, 4).map((rel: any, idx: number) => {
              const post = rel.post;
              const isFeatured = idx === 0;
              return (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={[
                    "border border-line bg-surface p-3 flex flex-col justify-between hover:bg-paper transition-colors",
                    isFeatured ? "col-span-2 row-span-2" : "col-span-1 row-span-1",
                  ].join(" ")}
                >
                  <span className={`font-sans font-semibold leading-snug ${isFeatured ? "text-base" : "text-sm"}`}>
                    {post.title}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "Draft"}
                    {" · "}♥ {post.likes.length}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
