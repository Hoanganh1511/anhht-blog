"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Block } from "@blocknote/core";
import { getPresignedUploadUrl, createPost, updatePost } from "@/app/actions/admin";

const BlockEditor = dynamic(
  () => import("./BlockEditor").then((m) => m.BlockEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-100 border border-line bg-paper animate-pulse" />
    ),
  },
);

interface ChildCategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  children: ChildCategory[];
}

interface PostData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  coverImages?: string[];
  content?: Block[];
  status?: "DRAFT" | "PUBLISHED";
  featured?: boolean;
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
    initialData.categoryIds ?? [],
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (initialData.categoryIds?.length) {
      categories.forEach((parent) => {
        if (
          parent.children.some((c) => initialData.categoryIds!.includes(c.id))
        ) {
          initial.add(parent.id);
        }
      });
    }
    return initial;
  });
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData.coverImages ?? []);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [featured, setFeatured] = useState(initialData.featured ?? false);
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
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl(
        file.name,
        file.type,
        file.size,
      );

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

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    setUploadingGallery(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const localUrl = URL.createObjectURL(file);
          try {
            const { uploadUrl, publicUrl } = await getPresignedUploadUrl(file.name, file.type, file.size);
            const s3Res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            if (!s3Res.ok) throw new Error("Upload S3 thất bại");
            URL.revokeObjectURL(localUrl);
            return publicUrl;
          } catch {
            URL.revokeObjectURL(localUrl);
            throw new Error(`Upload thất bại: ${file.name}`);
          }
        }),
      );
      setGalleryImages((prev) => [...prev, ...uploaded].slice(0, 8));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setUploadingGallery(false);
    }
  }

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleGroup = (parentId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) { next.delete(parentId); } else { next.add(parentId); }
      return next;
    });
  };

  const handleBlocks = useCallback((b: Block[]) => setBlocks(b), []);

  async function submit(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) {
      setError("Tiêu đề không được trống.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug không được trống.");
      return;
    }
    setError(null);
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      coverImages: galleryImages,
      content: blocks,
      status,
      featured,
      categoryIds: selectedCategories,
    };

    try {
      const post =
        mode === "create"
          ? await createPost(payload)
          : await updatePost(initialData!.id!, payload);
      router.push(`/admin/posts/${post.id}/edit`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  }

  const standaloneSelected = categories
    .filter((p) => p.children.length === 0)
    .some((p) => selectedCategories.includes(p.id));
  const childSelected = selectedCategories.some((id) =>
    categories.some((p) => p.children.some((c) => c.id === id)),
  );

  const inputCls =
    "w-full border border-line bg-paper font-mono text-sm py-2 px-3 outline-none focus:border-ink transition-colors";
  const labelCls =
    "block font-mono text-xs uppercase tracking-[1.5px] text-muted mb-1.5";

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
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
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
              <img
                src={coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-mono text-[10px] text-muted">
                Chưa có ảnh
              </span>
            )}
          </div>
          {/* Upload controls */}
          <div className="flex flex-col gap-2">
            <label
              className={`${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} inline-flex items-center gap-2 border border-line rounded-sm px-4 py-2 font-mono text-sm text-muted hover:text-ink hover:border-ink transition-colors`}
            >
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

      {/* Gallery images */}
      <div>
        <label className={labelCls}>Ảnh bổ sung <span className="normal-case text-muted/60">({galleryImages.length}/8)</span></label>
        <div className="flex flex-wrap gap-2 items-end">
          {galleryImages.map((src, i) => (
            <div key={i} className="relative shrink-0 border border-line overflow-hidden" style={{ width: 56, aspectRatio: "9/16" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setGalleryImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-ink/80 text-paper rounded-full flex items-center justify-center leading-none text-[10px] hover:bg-ink cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {galleryImages.length < 8 && (
            <label
              className={`shrink-0 border border-dashed border-line flex items-center justify-center text-xl text-muted transition-colors ${uploadingGallery ? "opacity-50 cursor-not-allowed" : "hover:border-ink hover:text-ink cursor-pointer"}`}
              style={{ width: 56, aspectRatio: "9/16" }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={uploadingGallery}
                onChange={handleGalleryUpload}
              />
              {uploadingGallery ? "..." : "+"}
            </label>
          )}
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

      {/* Featured */}
      <label className="flex items-center gap-3 cursor-pointer group w-fit">
        <span
          className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-colors ${
            featured ? "bg-ink border-ink" : "border-line group-hover:border-ink"
          }`}
        >
          {featured && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="sr-only"
        />
        <span className="font-mono text-sm text-ink">Bài viết nổi bật</span>
      </label>

      {/* Categories */}
      <div>
        <label className={labelCls}>Danh mục</label>
        {categories.length === 0 ? (
          <p className="font-mono text-xs text-muted">Chưa có danh mục nào.</p>
        ) : (
          <div className="border border-line divide-y divide-line">
            {categories.map((parent) => {
              const hasChildren = parent.children.length > 0;

              // Standalone parent (no children) — direct checkbox
              if (!hasChildren) {
                const checked = selectedCategories.includes(parent.id);
                const disabled = childSelected || (standaloneSelected && !checked);
                return (
                  <label
                    key={parent.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                      disabled ? "opacity-35 cursor-not-allowed" : "cursor-pointer group hover:bg-surface"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleCategory(parent.id)}
                      className="sr-only"
                    />
                    <span
                      className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-colors ${
                        checked ? "bg-ink border-ink" : "border-line group-hover:border-ink"
                      }`}
                    >
                      {checked && (
                        <span className="text-paper text-[8px] leading-none select-none">✓</span>
                      )}
                    </span>
                    <span className={`font-mono text-xs uppercase tracking-[1px] transition-colors ${checked ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                      {parent.name}
                    </span>
                  </label>
                );
              }

              // Parent with children — accordion
              const isOpen = openGroups.has(parent.id);
              const selectedCount = parent.children.filter((c) =>
                selectedCategories.includes(c.id),
              ).length;
              const accordionDisabled = standaloneSelected;
              return (
                <div key={parent.id} className={accordionDisabled ? "opacity-35" : ""}>
                  <button
                    type="button"
                    onClick={() => !accordionDisabled && toggleGroup(parent.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${
                      accordionDisabled ? "cursor-not-allowed" : "hover:bg-surface"
                    }`}
                  >
                    <span className="font-mono text-xs uppercase tracking-[1px] text-ink flex items-center gap-2">
                      {parent.name}
                      {selectedCount > 0 && (
                        <span className="text-[10px] bg-ink text-paper px-1.5 py-0.5 leading-none">
                          {selectedCount}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-muted select-none">
                      {isOpen ? "▼" : "▶"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5 bg-surface">
                      {parent.children.map((child) => {
                        const checked = selectedCategories.includes(child.id);
                        return (
                          <label
                            key={child.id}
                            className="flex items-center gap-2.5 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCategory(child.id)}
                              className="sr-only"
                            />
                            <span
                              className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-colors ${
                                checked ? "bg-ink border-ink" : "border-line group-hover:border-ink"
                              }`}
                            >
                              {checked && (
                                <span className="text-paper text-[8px] leading-none select-none">✓</span>
                              )}
                            </span>
                            <span className={`font-mono text-xs transition-colors ${checked ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                              {child.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Content editor */}
      <div>
        <label className={labelCls}>Nội dung</label>
        <BlockEditor initialContent={blocks} onChange={handleBlocks} />
      </div>

      {/* Error */}
      {error && <p className="font-mono text-xs text-accent-coral">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-line">
        <button
          type="button"
          disabled={saving}
          onClick={() => submit("DRAFT")}
          className="font-mono text-sm border border-line rounded-sm px-5 py-2 text-muted hover:text-ink hover:border-ink transition-colors disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu nháp"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => submit("PUBLISHED")}
          className="font-mono text-sm bg-ink text-paper rounded-sm px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-50"
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
