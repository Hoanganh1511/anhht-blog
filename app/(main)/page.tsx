import { serverFetch } from "@/lib/server-api";
import { getSession } from "@/lib/session";
import { MobileCategoryBar } from "@/components/MobileCategoryBar";
import { CategorySection } from "@/components/CategorySection";

interface PostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  coverImage?: string | null;
  likes: unknown[];
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  posts: { post: PostData }[];
}

export default async function HomePage() {
  const [res, session] = await Promise.all([serverFetch("/categories"), getSession()]);
  const categories: CategoryData[] = res.ok ? await res.json() : [];
  const authorImage = session?.user?.image ?? null;
  const authorName = session?.user?.name ?? "Tuấn Anh";

  if (categories.length === 0) {
    return (
      <main className="px-6 py-12">
        <p className="font-mono text-muted text-sm">Chưa có bài viết nào.</p>
      </main>
    );
  }

  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const withPosts = categories.filter((c) => c.posts.length > 0);

  return (
    <>
      <MobileCategoryBar categories={categories} />
      <main className="px-4 md:px-8 xl:px-12 pt-4 pb-10">
        <div className="flex flex-col">
          {withPosts.map((cat, i) => (
            <CategorySection
              key={cat.id}
              category={cat}
              parentName={cat.parentId ? nameById.get(cat.parentId) : undefined}
              index={i}
              variant={i === 0 ? "cards" : "list"}
              authorImage={authorImage}
              authorName={authorName}
            />
          ))}
        </div>
      </main>
    </>
  );
}
