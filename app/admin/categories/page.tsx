import { serverFetch } from "@/lib/server-api";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const metadata = { title: "Danh mục — Admin" };

export default async function AdminCategoriesPage() {
  const res = await serverFetch("/admin/categories");
  const categories = res.ok ? await res.json() : [];

  return (
    <div className="bg-paper rounded px-6 py-6">
      <CategoriesClient categories={categories} />
    </div>
  );
}
