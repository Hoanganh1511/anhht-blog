"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/admin";
import { useModal } from "@/lib/modal-context";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { CategoryDndList } from "./CategoryDndList";

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
  parentId: string | null;
  _count?: { posts: number };
  children?: Category[];
};

type FlatCategory = Category & { depth: number };

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function flatten(cats: Category[], depth = 0): FlatCategory[] {
  return cats.flatMap((cat) => [
    { ...cat, depth },
    ...flatten(cat.children ?? [], depth + 1),
  ]);
}

// ─── Category form (used inside Modal) ───────────────────────────────────────

interface FormProps {
  initial?: Category;
  flatCats: FlatCategory[];
  onClose: () => void;
  onSaved: () => void;
}

function CategoryForm({ initial, flatCats, onClose, onSaved }: FormProps) {
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [parentId, setParentId] = useState(initial?.parentId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parentOptions = flatCats.filter((c) => c.id !== initial?.id);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(slugify(v));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      setError("Tên và slug không được để trống.");
      return;
    }
    setLoading(true);
    setError("");

    const payload = { name: name.trim(), slug: slug.trim(), order, parentId: parentId || null };
    try {
      if (isEdit) {
        await updateCategory(initial!.id, payload);
      } else {
        await createCategory(payload);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="font-mono text-xs text-red-500">{error}</p>}

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs text-muted uppercase tracking-wider">Tên</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="border border-line rounded px-3 py-2 text-sm text-ink bg-paper focus:outline-none focus:border-ink"
          placeholder="Tên danh mục"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs text-muted uppercase tracking-wider">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border border-line rounded px-3 py-2 text-sm font-mono text-ink bg-paper focus:outline-none focus:border-ink"
          placeholder="slug-danh-muc"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="font-mono text-xs text-muted uppercase tracking-wider">Danh mục cha</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="border border-line rounded px-3 py-2 text-sm text-ink bg-paper focus:outline-none focus:border-ink"
          >
            <option value="">— Không có —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {"　".repeat(c.depth)}{c.depth > 0 ? "└ " : ""}{c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 w-20">
          <label className="font-mono text-xs text-muted uppercase tracking-wider">Thứ tự</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="border border-line rounded px-3 py-2 text-sm font-mono text-ink bg-paper focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="-mx-6 -mb-5 px-6 py-4 flex items-center justify-end gap-3"
        style={{ backgroundColor: "#F5F5F5" }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="font-mono text-sm text-muted hover:text-ink border b-soft rounded-sm px-5 py-2 bg-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="font-mono text-sm bg-ink text-paper rounded-sm px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { open, close } = useModal();
  const confirm = useConfirm();

  const flatForForm = flatten(categories);

  const openForm = (initial?: Category) => {
    open(
      <CategoryForm
        initial={initial}
        flatCats={flatForForm}
        onClose={close}
        onSaved={() => router.refresh()}
      />,
      { title: initial ? "Sửa danh mục" : "Thêm danh mục", size: "md" },
    );
  };

  const handleDelete = (cat: Category) => {
    confirm({
      title: "Xóa danh mục",
      description: (
        <>
          Xóa <strong>{cat.name}</strong>?{" "}
          Các bài viết trong danh mục này sẽ không bị xóa.
        </>
      ),
      confirmLabel: "Xóa",
      loadingLabel: "Đang xóa...",
      onConfirm: async () => {
        await deleteCategory(cat.id);
        router.refresh();
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono uppercase tracking-[2px] text-lg">Danh mục</h1>
        <button
          type="button"
          onClick={() => openForm()}
          className="font-mono text-xs border border-line bg-ink text-paper px-4 py-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          + Thêm
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="font-mono text-xs text-muted mt-6">Chưa có danh mục nào.</p>
      ) : (
        <CategoryDndList
          categories={categories}
          onEdit={openForm}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
