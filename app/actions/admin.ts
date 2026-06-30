"use server";

import { serverFetch, serverFetchRaw } from "@/lib/server-api";

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  size: number,
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await serverFetchRaw("/upload", {
    method: "POST",
    body: JSON.stringify({ filename, contentType, size }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface PostPayload {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  content?: unknown;
  status: "DRAFT" | "PUBLISHED";
  featured?: boolean;
  coverImages?: string[];
  categoryIds?: string[];
}

export async function createPost(data: PostPayload): Promise<{ id: string }> {
  const res = await serverFetchRaw("/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function updatePost(id: string, data: Partial<PostPayload>): Promise<{ id: string }> {
  const res = await serverFetchRaw(`/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function deletePost(id: string) {
  await serverFetch(`/admin/posts/${id}`, { method: "DELETE" });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface CategoryPayload {
  name: string;
  slug: string;
  order: number;
  parentId: string | null;
}

export async function createCategory(data: CategoryPayload) {
  const res = await serverFetchRaw("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function updateCategory(id: string, data: Partial<CategoryPayload>) {
  const res = await serverFetchRaw(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function reorderCategories(items: { id: string; order: number }[]) {
  const res = await serverFetchRaw("/admin/categories/reorder", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Lỗi khi lưu thứ tự.");
}

export async function deleteCategory(id: string) {
  const res = await serverFetchRaw(`/admin/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Lỗi ${res.status}`);
  }
}
