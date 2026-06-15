import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: postId } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập để bình luận" }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await req.json();

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Nội dung không được trống" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session.user.id,
      content: body.content,
      parentId: body.parentId ?? null,
      images: body.images ?? [],
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
