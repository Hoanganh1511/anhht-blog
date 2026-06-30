"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderCategories } from "@/app/actions/admin";
import type { Category } from "./CategoriesClient";

// ── Icons ──────────────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
      <circle cx="3.5" cy="2.5" r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="7"   r="1.5" fill="currentColor" />
      <circle cx="3.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="2.5" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="7"   r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ── Flat item shape used internally ───────────────────────────────────────────

interface FlatItem {
  id: string;
  name: string;
  slug: string;
  order: number;
  postCount: number;
  depth: number;
  /** "root" for top-level parents; parent.id for children */
  group: string;
  raw: Category;
}

function flatten(categories: Category[]): FlatItem[] {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  return sorted.flatMap((parent) => {
    const children = [...(parent.children ?? [])].sort((a, b) => a.order - b.order);
    return [
      {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        order: parent.order,
        postCount: parent._count?.posts ?? 0,
        depth: 0,
        group: "root",
        raw: parent,
      },
      ...children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        order: child.order,
        postCount: child._count?.posts ?? 0,
        depth: 1,
        group: parent.id,
        raw: child,
      })),
    ];
  });
}

// ── Single sortable row ────────────────────────────────────────────────────────

function SortableRow({
  item,
  onEdit,
  onDelete,
  overlay = false,
}: {
  item: FlatItem;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, data: { group: item.group } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        paddingLeft: item.depth * 20,
      }}
      className={`flex items-center gap-3 px-4 py-3 border-b text-sm ${
        overlay ? "bg-paper shadow-lg border border-line rounded" : "bg-paper border-line/30 hover:bg-surface"
      } transition-colors`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted/50 hover:text-muted cursor-grab active:cursor-grabbing shrink-0 touch-none"
        tabIndex={-1}
        aria-label="Kéo để sắp xếp"
      >
        <GripIcon />
      </button>

      {/* Depth indicator */}
      {item.depth > 0 && <span className="text-muted text-xs shrink-0">└</span>}

      {/* Name */}
      <span className={`flex-1 min-w-0 truncate ${item.depth === 0 ? "font-medium" : ""}`}>
        {item.name}
      </span>

      {/* Slug */}
      <span className="w-40 font-mono text-xs text-muted truncate hidden sm:block">
        {item.slug}
      </span>

      {/* Post count */}
      <span className="w-12 text-center font-mono text-xs text-muted hidden md:block">
        {item.postCount}
      </span>

      {/* Actions */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => onEdit(item.raw)}
          className="font-mono text-xs text-muted hover:text-ink underline transition-colors cursor-pointer px-2"
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.raw)}
          className="font-mono text-xs text-red-500 hover:text-red-700 underline transition-colors cursor-pointer px-2"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────────

export function CategoryDndList({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<FlatItem[]>(() => flatten(categories));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeGroup = (active.data.current as { group: string }).group;
      const overGroup = (over.data.current as { group: string }).group;
      if (activeGroup !== overGroup) return; // cross-group drop: cancel

      setItems((prev) => {
        // Work only within the affected group
        const groupItems = prev.filter((i) => i.group === activeGroup);
        const others = prev.filter((i) => i.group !== activeGroup);

        const oldIdx = groupItems.findIndex((i) => i.id === active.id);
        const newIdx = groupItems.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(groupItems, oldIdx, newIdx).map((item, idx) => ({
          ...item,
          order: idx,
        }));

        // Save to server (fire-and-forget, refresh after)
        reorderCategories(reordered.map(({ id, order }) => ({ id, order }))).then(
          () => router.refresh(),
        );

        // Re-interleave: maintain original relative position of other groups
        return prev.map((item) => {
          const updated = reordered.find((r) => r.id === item.id);
          return updated ?? item;
        });
      });
    },
    [router],
  );

  const activeItem = items.find((i) => i.id === activeId) ?? null;

  return (
    <>
      {/* Table header */}
      <div className="flex items-center gap-3 px-4 pb-2 border-b border-line">
        <div className="w-5 shrink-0" /> {/* grip placeholder */}
        <span className="flex-1 font-mono text-xs text-muted uppercase tracking-wider">Tên</span>
        <span className="w-40 font-mono text-xs text-muted uppercase tracking-wider hidden sm:block">Slug</span>
        <span className="w-12 text-center font-mono text-xs text-muted uppercase tracking-wider hidden md:block">Bài viết</span>
        <span className="w-20 font-mono text-xs text-muted uppercase tracking-wider text-right">Hành động</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {/* Ghost overlay while dragging */}
        <DragOverlay>
          {activeItem && (
            <SortableRow
              item={activeItem}
              onEdit={onEdit}
              onDelete={onDelete}
              overlay
            />
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}
