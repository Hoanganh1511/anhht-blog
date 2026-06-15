import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
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

  // Seed tags
  const tagNext = await prisma.tag.upsert({
    where: { slug: "nextjs" },
    update: {},
    create: { name: "Next.js", slug: "nextjs" },
  });

  // Seed bài mẫu 1
  const post1 = await prisma.post.upsert({
    where: { slug: "xin-chao-the-gioi" },
    update: {},
    create: {
      slug: "xin-chao-the-gioi",
      title: "Xin chào thế giới",
      excerpt: "Bài đầu tiên trên blog.",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Xin chào! Đây là bài viết đầu tiên." }],
          },
        ],
      },
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.categoryOnPost.upsert({
    where: { postId_categoryId: { postId: post1.id, categoryId: tech.id } },
    update: {},
    create: { postId: post1.id, categoryId: tech.id },
  });

  await prisma.tagOnPost.upsert({
    where: { postId_tagId: { postId: post1.id, tagId: tagNext.id } },
    update: {},
    create: { postId: post1.id, tagId: tagNext.id },
  });

  // Seed bài mẫu 2
  const post2 = await prisma.post.upsert({
    where: { slug: "thu-hai-ve-cuoc-song" },
    update: {},
    create: {
      slug: "thu-hai-ve-cuoc-song",
      title: "Thứ Hai về cuộc sống",
      excerpt: "Suy nghĩ ngẫu nhiên trong tuần.",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Cuộc sống thú vị lắm." }],
          },
        ],
      },
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
    },
  });

  await prisma.categoryOnPost.upsert({
    where: { postId_categoryId: { postId: post2.id, categoryId: life.id } },
    update: {},
    create: { postId: post2.id, categoryId: life.id },
  });

  console.log("Seed hoàn tất:", {
    categories: [tech.name, life.name],
    posts: [post1.title, post2.title],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
