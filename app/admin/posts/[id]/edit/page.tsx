import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/server-api";
import { PostForm } from "@/components/admin/PostForm";
import type { Block } from "@blocknote/core";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Sửa bài" };

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const [postRes, catRes] = await Promise.all([
    serverFetch(`/admin/posts/${id}`),
    serverFetch("/categories"),
  ]);

  if (!postRes.ok) notFound();

  const post = await postRes.json();
  const categories: Category[] = catRes.ok ? await catRes.json() : [];

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    coverImage: post.coverImage ?? "",
    content: (post.content ?? []) as Block[],
    status: post.status as "DRAFT" | "PUBLISHED",
    categoryIds: (post.categories ?? []).map(
      (c: { category: Category }) => c.category.id
    ),
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-mono uppercase tracking-[2px] text-lg">Sửa bài</h1>
        <span
          className={`font-mono text-xs px-2 py-0.5 border ${
            post.status === "PUBLISHED"
              ? "border-accent-blue text-accent-blue"
              : "border-muted text-muted"
          }`}
        >
          {post.status === "PUBLISHED" ? "Đã đăng" : "Nháp"}
        </span>
      </div>
      <PostForm mode="edit" initialData={initialData} categories={categories} />
    </div>
  );
}
