"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Block } from "@blocknote/core";

const BlockEditor = dynamic(
  () => import("./BlockEditor").then((m) => m.BlockEditor),
  { ssr: false, loading: () => <div className="h-[400px] border border-line bg-paper animate-pulse" /> }
);

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  content?: Block[];
  status?: "DRAFT" | "PUBLISHED";
  categoryIds?: string[];
}

interface Props {
  mode: "create" | "edit";
  initialData?: PostData;
  categories: Category[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PostForm({ mode, initialData = {}, categories }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title ?? "");
  const [slug, setSlug] = useState(initialData.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(initialData.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initialData.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData.categoryIds ?? []
  );
  const [blocks, setBlocks] = useState<Block[]>(initialData.content ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hiện preview local ngay lập tức
    const localUrl = URL.createObjectURL(file);
    setCoverImage(localUrl);

    setUploading(true);
    setError(null);
    try {
      const presignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      if (!presignRes.ok) throw new Error("Không lấy được presigned URL");
      const { uploadUrl, publicUrl } = await presignRes.json();

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!s3Res.ok) throw new Error("Upload S3 thất bại");

      URL.revokeObjectURL(localUrl);
      setCoverImage(publicUrl);
    } catch (e: unknown) {
      URL.revokeObjectURL(localUrl);
      setCoverImage("");
      setError(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleBlocks = useCallback((b: Block[]) => setBlocks(b), []);

  async function submit(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) { setError("Tiêu đề không được trống."); return; }
    if (!slug.trim()) { setError("Slug không được trống."); return; }
    setError(null);
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      content: blocks,
      status,
      categoryIds: selectedCategories,
    };

    try {
      const url =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL}/posts`
          : `${process.env.NEXT_PUBLIC_API_URL}/posts/${initialData.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Lỗi ${res.status}`);
      }

      const post = await res.json();
      router.push(`/admin/posts/${post.id}/edit`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-line bg-paper font-mono text-sm py-2 px-3 outline-none focus:border-ink transition-colors";
  const labelCls = "block font-mono text-xs uppercase tracking-[1.5px] text-muted mb-1.5";

  return (
    <div className="max-w-3xl space-y-7">
      {/* Title */}
      <div>
        <label className={labelCls}>Tiêu đề</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Tiêu đề bài viết..."
          className={`${inputCls} text-base font-semibold`}
        />
      </div>

      {/* Slug */}
      <div>
        <label className={labelCls}>Slug</label>
        <div className="flex items-center border border-line bg-paper">
          <span className="font-mono text-xs text-muted px-3 border-r border-line py-2 shrink-0 select-none">
            /blog/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
            placeholder="url-cua-bai-viet"
            className="flex-1 bg-transparent font-mono text-sm py-2 px-3 outline-none"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className={labelCls}>Ảnh bìa</label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="w-40 h-24 border border-line shrink-0 overflow-hidden bg-surface flex items-center justify-center">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-[10px] text-muted">Chưa có ảnh</span>
            )}
          </div>
          {/* Upload controls */}
          <div className="flex flex-col gap-2">
            <label className={`${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-sm text-muted hover:text-ink hover:border-ink transition-colors`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={handleCoverUpload}
              />
              {uploading ? "Đang upload..." : "Chọn ảnh"}
            </label>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="font-mono text-xs text-muted hover:text-accent-coral transition-colors text-left"
              >
                Xoá ảnh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelCls}>Tóm tắt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Mô tả ngắn về bài viết..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Categories */}
      <div>
        <label className={labelCls}>Danh mục</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`font-mono text-xs px-3 py-1 border transition-colors ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
          {categories.length === 0 && (
            <p className="font-mono text-xs text-muted">Chưa có danh mục nào.</p>
          )}
        </div>
      </div>

      {/* Content editor */}
      <div>
        <label className={labelCls}>Nội dung</label>
        <BlockEditor initialContent={blocks} onChange={handleBlocks} />
      </div>

      {/* Error */}
      {error && (
        <p className="font-mono text-xs text-accent-coral">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-line">
        <button
          type="button"
          disabled={saving}
          onClick={() => submit("DRAFT")}
          className="font-mono text-sm border border-line px-5 py-2 text-muted hover:text-ink hover:border-ink transition-colors disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu nháp"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit("PUBLISHED")}
          className="font-mono text-sm bg-ink text-paper px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Xuất bản"}
        </button>
        <a
          href="/admin"
          className="ml-auto font-mono text-xs text-muted hover:text-ink transition-colors"
        >
          ← Huỷ
        </a>
      </div>
    </div>
  );
}
