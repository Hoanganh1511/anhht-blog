# anhht-blog

Blog cá nhân — Next.js 16 · TypeScript · Tailwind v4 · Prisma v6 · Auth.js v5

## Tech stack

| Hạng mục | Lựa chọn |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Auth.js v5 (NextAuth) — Google + GitHub OAuth |
| Styling | Tailwind CSS v4 |
| Storage | S3-compatible (MinIO / Cloudflare R2 / AWS S3) |

## Chạy local

### 1. Cài dependencies

```bash
npm install
```

### 2. Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Điền các giá trị vào `.env.local`:

- `DATABASE_URL` — chuỗi kết nối PostgreSQL
- `AUTH_SECRET` — chạy `npx auth secret` để sinh ngẫu nhiên
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — tạo trên Google Cloud Console
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — tạo trên GitHub Developer Settings
- `ADMIN_EMAIL` — email của bạn, tài khoản này sẽ tự nhận quyền ADMIN khi đăng nhập
- `S3_*` — thông tin bucket S3-compatible (MinIO, R2, hoặc AWS S3)

### 3. Generate Prisma client + migrate DB

```bash
npm run db:generate   # sinh Prisma client
npm run db:migrate    # tạo bảng trong DB (đặt tên migration khi được hỏi)
```

### 4. Seed dữ liệu mẫu

```bash
npm run db:seed
```

Tạo 2 categories (Tech, Life) và 2 bài mẫu.

### 5. Khởi động dev server

```bash
npm run dev
```

Truy cập http://localhost:3000

## Cấu trúc thư mục

```
app/
  page.tsx                    # Trang chủ (Bento Grid theo category)
  blog/[slug]/page.tsx        # Chi tiết bài
  category/[slug]/page.tsx    # Danh mục + phân trang
  login/page.tsx              # Đăng nhập OAuth
  admin/                      # CMS — chỉ ADMIN
    layout.tsx
    page.tsx                  # Dashboard danh sách bài
    posts/new/page.tsx
    posts/[id]/edit/page.tsx
    media/page.tsx
  api/
    auth/[...nextauth]/route.ts
    posts/route.ts            # GET list, POST create
    posts/[id]/route.ts       # GET detail, PATCH, DELETE
    posts/[id]/like/route.ts  # Toggle tim
    posts/[id]/share/route.ts # +1 share
    posts/[id]/view/route.ts  # +1 view
    posts/[id]/comments/route.ts
    comments/[id]/route.ts    # DELETE comment
    upload/route.ts           # Presigned URL

lib/
  prisma.ts                   # Prisma singleton
  s3.ts                       # S3 presigned URL helper

auth.ts                       # Auth.js config
middleware.ts                 # Bảo vệ /admin/*

prisma/
  schema.prisma
  seed.ts
```

## Phân quyền

| Nhóm | Quyền |
|---|---|
| Khách | Xem danh sách + chi tiết bài |
| User đăng nhập | + Tim bài, bình luận (text/emoji/ảnh) |
| Admin (ADMIN_EMAIL) | + Toàn quyền CMS |

## Các giai đoạn tiếp theo

- **Phase 1** — BlockNote editor (CMS soạn bài)
- **Phase 2** — Render BlockNote JSON trên trang chi tiết
- **Phase 3** — Tim / share / view count (UI)
- **Phase 4** — Bình luận (text / emoji / ảnh / reply)
- **Phase 5** — SEO, phân trang, đánh bóng UI
