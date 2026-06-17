# Auth Flow

## Kiến trúc

```
Frontend (Next.js :3000)  ←→  Backend (Express :4000 / Auth.js)  ←→  Google / GitHub OAuth
```

Session được lưu dưới dạng **JWT cookie** do Auth.js phát hành sau khi OAuth thành công.

| Môi trường | Tên cookie |
|---|---|
| dev | `authjs.session-token` |
| prod | `__Secure-authjs.session-token` |

---

## Luồng đăng nhập

```
User click "Tiếp tục với Google"
  │
  ├─ 1. GET  /auth/csrf          → lấy csrfToken
  │
  └─ 2. POST /auth/signin/google (form submit, có csrfToken + callbackUrl)
          │
          └─ Auth.js redirect → Google OAuth → callback → set JWT cookie
                    │
                    └─ redirect về FRONTEND_URL (trang chủ)
```

Code: [components/SignInButton.tsx](components/SignInButton.tsx)

---

## Đọc session ở Server Component

Dùng `getSession()` — đọc và decode JWT cookie trực tiếp, **không gọi API**.

```ts
import { getSession } from "@/lib/session";

const session = await getSession();
// session?.user.id, session?.user.role ("USER" | "ADMIN")
```

Code: [lib/session.ts](lib/session.ts)

---

## Gọi API từ Server Component

Dùng `serverFetch()` — tự forward cookie session vào header `Cookie`.

```ts
import { serverFetch } from "@/lib/server-api";

const res = await serverFetch("/posts");
```

Code: [lib/server-api.ts](lib/server-api.ts)

---

## Bảo vệ trang Admin

`AdminLayout` (Server Component) gọi `getSession()` và redirect nếu không phải ADMIN:

```ts
const session = await getSession();
if (session?.user?.role !== "ADMIN") redirect("/");
```

Code: [app/admin/layout.tsx](app/admin/layout.tsx)

---

## Middleware phía Backend

| Middleware | Dùng khi |
|---|---|
| `requireAuth` | Route cần đăng nhập, trả 401 nếu không có cookie hợp lệ |
| `requireAdmin` | Route chỉ dành cho ADMIN, trả 403 nếu không đủ quyền |
| `optionalAuth` | Gắn `req.user` nếu có cookie, không bắt buộc |

Code: [anhht-blog-api/src/middleware/auth.ts](../anhht-blog-api/src/middleware/auth.ts)

---

## ADMIN

Email trong env `ADMIN_EMAIL` tự động được gán role `ADMIN` khi đăng nhập lần đầu.

---

## Đăng xuất

```ts
await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
```

Express xóa cookie session, user về trạng thái guest.
