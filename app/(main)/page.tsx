import { serverFetch } from "@/lib/server-api";
import { MobileCategoryBar } from "@/components/MobileCategoryBar";
import { CategorySection } from "@/components/CategorySection";
import { SocialLinks } from "@/components/SocialLinks";

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
  posts: { post: PostData }[];
}

export default async function HomePage() {
  const res = await serverFetch("/categories");
  const categories: CategoryData[] = res.ok ? await res.json() : [];

  if (categories.length === 0) {
    return (
      <main className="px-6 py-12">
        <p className="font-mono text-muted text-sm">Chưa có bài viết nào.</p>
      </main>
    );
  }

  return (
    <>
      <MobileCategoryBar categories={categories} />
      <main className="px-4 md:px-8 xl:px-12 pt-4 pb-10">
        {categories.map((cat, i) => (
          <CategorySection key={cat.id} category={cat} index={i} />
        ))}
        {/* Social links for mobile — sidebar handles desktop */}
        <div className="md:hidden pt-4">
          <SocialLinks />
        </div>
      </main>
    </>
  );
}
