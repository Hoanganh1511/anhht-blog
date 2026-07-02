"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useModal } from "@/lib/modal-context";
import { LoginPopup } from "@/components/LoginPopup";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import type { CommentData, CommentsPage } from "./types";

interface Props {
  postId: string;
  isLoggedIn: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
  currentUserName?: string | null;
  currentUserImage?: string | null;
  initialData: CommentsPage;
}

async function readError(res: Response, fallback: string): Promise<never> {
  const data = await res.json().catch(() => null);
  throw new Error(data?.error ?? fallback);
}

export function CommentsSection({
  postId,
  isLoggedIn,
  currentUserId,
  isAdmin,
  currentUserName,
  currentUserImage,
  initialData,
}: Props) {
  const [comments, setComments] = useState<CommentData[]>(initialData.comments);
  const [total, setTotal] = useState(initialData.total);
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { open, close } = useModal();

  const openLogin = () => open(<LoginPopup onClose={close} />, { size: "sm" });

  const handleCreate = async (content: string, parentId?: string) => {
    const res = await apiFetch(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId }),
    });
    if (!res.ok) await readError(res, "Không gửi được bình luận");
    const created: CommentData = await res.json();

    if (created.parentId) {
      setComments((list) =>
        list.map((c) =>
          c.id === created.parentId
            ? { ...c, replies: [...(c.replies ?? []), created] }
            : c,
        ),
      );
    } else {
      setComments((list) => [{ ...created, replies: [] }, ...list]);
    }
    setTotal((t) => t + 1);
  };

  const handleEdit = async (id: string, content: string) => {
    const res = await apiFetch(`/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
    if (!res.ok) await readError(res, "Không sửa được bình luận");
    const updated = await res.json();

    setComments((list) =>
      list.map((c) => {
        if (c.id === id) return { ...c, content: updated.content, updatedAt: updated.updatedAt };
        if (c.replies?.some((r) => r.id === id)) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === id ? { ...r, content: updated.content, updatedAt: updated.updatedAt } : r,
            ),
          };
        }
        return c;
      }),
    );
  };

  const handleDelete = async (id: string) => {
    const res = await apiFetch(`/comments/${id}`, { method: "DELETE" });
    if (!res.ok) return;

    setComments((list) => {
      const target = list.find((c) => c.id === id);
      if (target) {
        // Xóa comment gốc kéo theo cả replies
        setTotal((t) => t - 1 - (target.replies?.length ?? 0));
        return list.filter((c) => c.id !== id);
      }
      setTotal((t) => t - 1);
      return list.map((c) =>
        c.replies?.some((r) => r.id === id)
          ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
          : c,
      );
    });
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setLoadError(null);
    try {
      const res = await apiFetch(`/posts/${postId}/comments?cursor=${nextCursor}`);
      if (!res.ok) throw new Error();
      const data: CommentsPage = await res.json();
      setComments((list) => {
        const seen = new Set(list.map((c) => c.id));
        return [...list, ...data.comments.filter((c) => !seen.has(c.id))];
      });
      setTotal(data.total);
      setNextCursor(data.nextCursor);
    } catch {
      setLoadError("Không tải được bình luận, vui lòng thử lại");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="border-t border-line-primary pt-8">
      <h2 className="font-mono uppercase tracking-[2px] text-sm mb-6">
        Bình luận{total > 0 ? ` (${total})` : ""}
      </h2>

      <CommentForm
        isLoggedIn={isLoggedIn}
        onRequireLogin={openLogin}
        userName={currentUserName}
        userImage={currentUserImage}
        onSubmit={(content) => handleCreate(content)}
      />

      {comments.length === 0 ? (
        <p className="font-mono text-xs text-muted mt-8">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="flex flex-col gap-6 mt-8">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              currentUserName={currentUserName}
              currentUserImage={currentUserImage}
              onRequireLogin={openLogin}
              onReply={(rootId, content) => handleCreate(content, rootId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="font-mono text-sm text-muted hover:text-ink border b-soft rounded-sm px-5 py-2 bg-white transition-colors cursor-pointer disabled:opacity-40"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        </div>
      )}

      {loadError && (
        <p className="font-mono text-xs text-accent-coral mt-2" role="alert">
          {loadError}
        </p>
      )}
    </section>
  );
}
