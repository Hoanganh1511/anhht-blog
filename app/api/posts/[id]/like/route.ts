import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập để tim bài" }, { status: 401 });
  }

  const { id: postId } = await params;
  const userId = session.user.id;

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
    return NextResponse.json({ liked: true });
  }
}
