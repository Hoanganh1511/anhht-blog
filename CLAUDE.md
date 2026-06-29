@AGENTS.md

# anhht-blog — Personal Blog Frontend

## Architecture Overview

Two-repo full-stack setup:
- **`anhht-blog`** (this repo) — Next.js 16 frontend, port 3000
- **`anhht-blog-api`** (sibling directory) — Express 5 API server, port 4000

The frontend never talks to the database directly. All data access goes through the Express API. Session cookies issued by NextAuth (via Express) are forwarded manually on server-side fetches.

## Critical: Bleeding-Edge Versions

Every major dependency is at a breaking-change version. Before touching any API surface, check the actual installed package docs:

| Package | Version | Why it matters |
|---|---|---|
| Next.js | 16.2.9 | Breaking changes from 14/15 — read `node_modules/next/dist/docs/` |
| React | 19.2.4 | New compiler, use/cache hooks, breaking ref behavior |
| Prisma | 6.x | New client API, generated output in `app/generated/prisma/` |
| NextAuth | 5.0.0-beta | Completely rewritten from v4, `auth()` not `getServerSession()` |
| Express | 5.x | Async error handling, no more `next(err)` pattern |
| Tailwind CSS | 4.x | Config-less by default, CSS-first config in `globals.css` |

**Rule**: If you're about to call an API you learned in training, read the installed package source first.

## Project Structure

```
app/
  (main)/           # Public blog — layout wraps every page with Sidebar
    page.tsx        # Home: fetches /categories, renders CategorySection list
    blog/[slug]/    # Post detail page
    category/[slug]/
  admin/            # Admin panel (role=ADMIN required, checked in layout)
    page.tsx        # Dashboard
    posts/new/      # New post editor (BlockNote)
    posts/[id]/edit/
    media/          # S3 media browser
  generated/prisma/ # ORPHANED — leftover from old setup, nothing imports this
  layout.tsx        # Root layout: fonts, Header, ScrollToTop
  login/page.tsx

components/
  nav/              # Header subcomponents (Logo, NavMenu, UserNav, MobileMenu)
  admin/            # BlockEditor, PostForm
  Sidebar.tsx       # Desktop sidebar (categories + social links)
  ...

lib/
  api.ts            # Client-side fetch wrapper — apiFetch() sends credentials
  server-api.ts     # Server-side fetch wrapper — serverFetch() forwards session cookie
  session.ts        # getSession() — thin wrapper around NextAuth auth()

prisma/
  schema.prisma     # Source of truth (shared with API repo via symlink or copy)
```

## Data Fetching Patterns

### Server Components (preferred)
```ts
// lib/server-api.ts — forwards session cookie automatically
const res = await serverFetch("/posts");
const data = res.ok ? await res.json() : [];
```

### Client Components
```ts
// lib/api.ts — sends credentials cookie cross-origin
const res = await apiFetch("/posts", { method: "POST", body: JSON.stringify(data) });
```

Never import `serverFetch` in a Client Component — it uses `next/headers` which is server-only.

## Auth Pattern

Auth runs entirely inside the Express API (`@auth/express`). The session cookie (`authjs.session-token` in dev, `__Secure-authjs.session-token` in prod) is issued by Express.

The Next.js frontend does **not** use Prisma or NextAuth — it reads the session by decoding the JWT cookie directly via `@auth/core/jwt` in `lib/session.ts`. No adapter, no DB call.

`serverFetch` in `lib/server-api.ts` reads the same cookie and forwards it as a `Cookie` header to Express — this is how server components authenticate API calls.

Admin gate is in `app/admin/layout.tsx`:
```ts
const session = await getSession();
if (session?.user?.role !== "ADMIN") redirect("/");
```

## Environment Variables

Frontend (`.env.local`):
- `NEXT_PUBLIC_API_URL` — public API base URL (used by client components), default `http://localhost:4000`
- `API_URL` — server-side API base URL (used by server components), default `http://localhost:4000`

API (`.env`):
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (must match between frontend and API)
- `AWS_*` — S3 credentials for media uploads

## Content: BlockNote

Posts are stored as BlockNote JSON (`content Json` in Prisma schema). The editor (`components/admin/BlockEditor.tsx`) is client-only. The renderer (`components/PostContent.tsx`) renders BlockNote JSON to HTML server-side or client-side via `PostContentClient.tsx`.

## Styling Conventions

Tailwind CSS v4 with CSS-first config. Custom design tokens are defined in `app/globals.css` as CSS variables:
- `text-ink` / `text-muted` — primary/secondary text
- `bg-paper` — background
- `border-line` — border color
- Font classes: `font-mono` (IBM Plex Mono), default is Inter

No `tailwind.config.js` — Tailwind v4 picks up config from `postcss.config.mjs` and CSS `@theme` blocks.

## Database

The frontend has **no direct database access**. All data goes through the Express API. Prisma lives entirely in `anhht-blog-api`.

The `app/generated/prisma/` folder and `prisma.config.ts` are orphaned leftovers — nothing imports them. The `db:*` scripts in `package.json` are also stale. Do not use or reference them.

## Development

```bash
# Frontend (this repo)
npm run dev          # http://localhost:3000

# API (sibling repo)
cd ../anhht-blog-api
npm run dev          # http://localhost:4000

# DB
npm run db:migrate   # apply migrations
npm run db:studio    # Prisma Studio GUI
npm run db:seed      # seed data
```

Both services must be running for the frontend to work.

## Key Gotchas

1. **No Prisma on the frontend**: The frontend has zero DB access. `app/generated/prisma/` and `prisma.config.ts` are stale leftovers — ignore them. Prisma only exists in `anhht-blog-api`.
2. **`use client` boundary**: BlockNote and Framer Motion must be in Client Components. Heavy animations go in `components/AnimatedCardRow.tsx`.
3. **NextAuth v5 `auth()`**: returns `null` when unauthenticated (not throws). `session?.user` may be undefined.
4. **Express 5 async errors**: thrown errors in async route handlers propagate automatically — no need for `try/catch` + `next(err)`.
5. **Tailwind v4**: `@apply` works but CSS variables via `@theme` are preferred. No `extend` key in config.
