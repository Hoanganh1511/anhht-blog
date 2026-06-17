import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const DAY = 86_400_000;

async function upsertPost(
  slug: string,
  title: string,
  excerpt: string,
  categoryId: string,
  daysAgo: number
) {
  const post = await prisma.post.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      title,
      excerpt,
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: excerpt }] }] },
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - daysAgo * DAY),
    },
  });
  await prisma.categoryOnPost.upsert({
    where: { postId_categoryId: { postId: post.id, categoryId } },
    update: {},
    create: { postId: post.id, categoryId },
  });
  return post;
}

async function main() {
  const tech = await prisma.category.upsert({
    where: { slug: "tech" },
    update: {},
    create: { name: "Tech", slug: "tech", order: 0 },
  });

  const life = await prisma.category.upsert({
    where: { slug: "life" },
    update: {},
    create: { name: "Life", slug: "life", order: 1 },
  });

  // Tech posts
  await upsertPost("xay-dung-blog-voi-nextjs", "Xây dựng blog cá nhân với Next.js 16 và Tailwind v4", "Hành trình từ một file trắng đến blog hoàn chỉnh — những quyết định kiến trúc và bài học rút ra.", tech.id, 0);
  await upsertPost("framer-motion-thuc-te", "Framer Motion trong thực tế: hơn cả animation", "Không chỉ là hiệu ứng đẹp — Framer Motion thay đổi cách người dùng cảm nhận sản phẩm của bạn.", tech.id, 3);
  await upsertPost("prisma-vs-drizzle", "Prisma vs Drizzle: chọn ORM nào cho dự án Node.js?", "So sánh thực tế sau khi dùng cả hai trong production — performance, DX và những điểm mà docs không nói.", tech.id, 7);
  await upsertPost("typescript-strict-mode", "TypeScript strict mode không đáng sợ như bạn nghĩ", "Bật strict:true và sống sót — một hướng dẫn thực hành từ codebase thực tế.", tech.id, 14);
  await upsertPost("css-container-queries", "Container Queries thay đổi cách viết responsive mãi mãi", "Quên media queries đi. Container queries mới là thứ bạn thực sự cần cho component-based design.", tech.id, 21);

  // Life posts
  await upsertPost("lam-viec-remote-mot-nam", "Một năm làm việc remote: thật ra như thế nào?", "Không có commute, không có văn phòng, không có đồng nghiệp ngồi cạnh — đây là những gì tôi học được.", life.id, 1);
  await upsertPost("doc-sach-ky-thuat", "Cách tôi đọc sách kỹ thuật mà không quên sau 3 ngày", "Hệ thống ghi chú và ôn luyện giúp kiến thức thực sự ngấm vào — không chỉ dừng ở highlight màu vàng.", life.id, 5);
  await upsertPost("burnout-lap-trinh-vien", "Burnout ở lập trình viên: nhận ra và vượt qua", "Tôi đã mất 6 tháng để nhận ra mình đang burnout. Đây là dấu hiệu và cách tôi hồi phục.", life.id, 10);
  await upsertPost("side-project-thuc-su", "Side project thực sự dạy bạn điều gì?", "Ba năm, bảy side project, một cái duy nhất còn sống — nhưng tất cả đều để lại thứ gì đó.", life.id, 18);

  console.log("Seed hoàn tất: 2 categories, 9 posts");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
