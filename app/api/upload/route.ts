import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPresignedUpload } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Cần đăng nhập để upload ảnh" }, { status: 401 });
  }

  const body = await req.json();
  const { filename, contentType, size } = body;

  if (!filename || !contentType || !size) {
    return NextResponse.json({ error: "Thiếu thông tin file" }, { status: 400 });
  }

  try {
    const { uploadUrl, key, publicUrl } = await createPresignedUpload(filename, contentType, size);

    // Lưu metadata vào DB
    await prisma.media.create({
      data: {
        key,
        url: publicUrl,
        type: contentType,
        size,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload thất bại";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
