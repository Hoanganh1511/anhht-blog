import { serverFetch } from "@/lib/server-api";
import { PostForm } from "@/components/admin/PostForm";

export const metadata = { title: "Bài mới" };

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export default async function NewPostPage() {
  const res = await serverFetch("/admin/categories");
  const categories: Category[] = res.ok ? await res.json() : [];

  return (
    <div>
      <h1 className="font-mono uppercase tracking-[2px] text-lg mb-8">
        Soạn bài mới
      </h1>
      <PostForm mode="create" categories={categories} />
    </div>
  );
}
