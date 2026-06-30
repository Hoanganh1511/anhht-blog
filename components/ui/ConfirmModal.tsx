"use client";

import { useState } from "react";
import { useModal } from "@/lib/modal-context";
import type { ModalSize } from "@/components/ui/Modal";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface ConfirmOptions {
  /** Tiêu đề modal (hiển thị centered ở title bar) */
  title: string;

  /** Nội dung body — nhận ReactNode để hỗ trợ bullet list, link, bold... */
  description: React.ReactNode;

  /** Label nút xác nhận. Default: "Xác nhận" */
  confirmLabel?: string;

  /** Label nút hủy. Default: "Hủy" */
  cancelLabel?: string;

  /** Text hiện khi đang loading. Default: "Đang xử lý..." */
  loadingLabel?: string;

  /**
   * Visual variant của nút xác nhận.
   * - "default" → nền đen (bg-ink), dùng cho thao tác bình thường
   * - "danger"  → nền đỏ, dùng cho thao tác không thể hoàn tác
   */
  variant?: "default" | "danger";

  /**
   * Ẩn nút Hủy — dùng khi chỉ cần 1 nút OK (info modal / notice).
   * Default: false
   */
  hideCancel?: boolean;

  /**
   * Callback tùy chỉnh khi ấn Hủy.
   * Default: đóng modal.
   */
  onCancel?: () => void;

  /** Async action khi ấn nút xác nhận */
  onConfirm: () => Promise<void> | void;

  /** Kích thước modal. Default: "sm" */
  size?: ModalSize;
}

// ─────────────────────────────────────────────
// Internal content component
// ─────────────────────────────────────────────

interface ContentProps extends Omit<ConfirmOptions, "title" | "size"> {
  onClose: () => void;
}

function ConfirmModalContent({
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loadingLabel = "Đang xử lý...",
  variant = "default",
  hideCancel = false,
  onConfirm,
  onCancel,
  onClose,
}: ContentProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel ? onCancel() : onClose();
  };

  const confirmCls =
    variant === "danger"
      ? "font-mono text-sm bg-red-500 text-white rounded-sm px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
      : "font-mono text-sm bg-ink text-paper rounded-sm px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer";

  return (
    <div>
      {/* Body */}
      <div className="text-sm text-ink leading-relaxed mb-5">
        {description}
      </div>

      {/* Footer — gray bg, negative margin bù padding px-6 py-5 của Modal */}
      <div
        className="-mx-6 -mb-5 px-6 py-4 flex items-center justify-end gap-3"
        style={{ backgroundColor: "#F5F5F5" }}
      >
        {!hideCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="font-mono text-sm text-muted hover:text-ink border b-soft rounded-sm px-5 py-2 bg-white transition-colors disabled:opacity-40 cursor-pointer"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={confirmCls}
        >
          {loading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Hook — cách dùng chính
// ─────────────────────────────────────────────

/**
 * Hook mở confirm modal từ bất kỳ client component nào.
 *
 * @example
 * const confirm = useConfirm();
 *
 * confirm({
 *   title: "Xác nhận xóa",
 *   description: "Không thể hoàn tác.",
 *   confirmLabel: "Xóa",
 *   variant: "danger",
 *   onConfirm: async () => { await deletePost(id); router.refresh(); },
 * });
 */
export function useConfirm() {
  const { open, close } = useModal();

  return (options: ConfirmOptions) => {
    const { title, size, ...rest } = options;
    open(
      <ConfirmModalContent {...rest} onClose={close} />,
      { title, size: size ?? "sm" },
    );
  };
}
