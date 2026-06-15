import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Sửa bài" };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-mono uppercase tracking-[2px] text-lg mb-2">Sửa bài</h1>
      <p className="font-mono text-xs text-muted mb-8">{post.title}</p>
      <p className="font-mono text-xs text-muted">
        [BlockNote editor sẽ implement ở Phase 1]
      </p>
    </div>
  );
}
