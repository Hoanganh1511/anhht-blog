"use client";

import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions/admin";
import { useConfirm } from "@/components/ui/ConfirmModal";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const confirm = useConfirm();

  return (
    <button
      type="button"
      onClick={() =>
        confirm({
          title: "Xác nhận xóa",
          description: "Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục.",
          confirmLabel: "Xóa",
          loadingLabel: "Đang xóa...",
          onConfirm: async () => {
            await deletePost(postId);
            router.refresh();
          },
        })
      }
      className="font-mono text-xs text-red-500 hover:text-red-700 underline transition-colors cursor-pointer px-2"
    >
      Xóa
    </button>
  );
}
