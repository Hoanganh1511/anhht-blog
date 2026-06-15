import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.update({
    where: { id },
    data: { shareCount: { increment: 1 } },
    select: { shareCount: true },
  });
  return NextResponse.json({ shareCount: post.shareCount });
}
