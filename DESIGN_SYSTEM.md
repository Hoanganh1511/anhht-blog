# Design System — anhht blog

Phong cách **technical-zine**: editorial, tối giản, không gradient, không bo tròn, font mono cho UI. Mọi hiệu ứng đều dịu nhẹ — không flash, không giật.

---

## Màu sắc

| Token | Tailwind class | Hex | Dùng cho |
|---|---|---|---|
| `--paper` | `bg-paper` / `text-paper` | `#F4F3EE` | Background trang |
| `--surface` | `bg-surface` | `#FAF9F5` | Card, dropdown, panel |
| `--ink` | `text-ink` | `#1A1A1A` | Text chính, border |
| `--muted` | `text-muted` | `#6B6A64` | Text phụ, placeholder |
| `--line` | `border-line` | `#1A1A1A` | Đường kẻ, border |
| `--accent-blue` | `text-accent-blue` | `#2563EB` | Link, admin badge |
| `--accent-coral` | `text-accent-coral` | `#E0541E` | Highlight, active state, cursor logo |
| `--code-bg` | `bg-code-bg` | `#F1EFE8` | Code block background |

---

## Typography

| Font | Variable | Dùng cho |
|---|---|---|
| IBM Plex Mono | `font-mono` | UI labels, nav, button, header |
| Inter | `font-sans` | Nội dung bài viết, body text |

**Quy tắc:**
- Label, nav, button → `font-mono uppercase tracking-[1px]` hoặc `tracking-[2px]`
- Logo → `font-mono uppercase tracking-[3px] text-sm font-semibold`
- Body text → `font-sans`
- Không dùng font-size lớn hơn cần thiết. Prefer `text-xs` / `text-sm` cho UI.

---

## Responsive breakpoints

```
xs   480px   (custom)
sm   640px
md   768px   ← điểm chuyển desktop/mobile cho Header
lg   1024px
xl   1280px
2xl  1536px
```

Pattern container chuẩn:
```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6">
```

---

## Animation — Nguyên tắc

> **Soft, rhythmic, never jarring.** Animation nên thêm vào trải nghiệm, không gây chú ý.

- Duration ngắn: `0.15s–0.3s`
- Spring cho interaction: `stiffness: 500–700, damping: 20–30`
- Easing chuẩn (ease-out expo): `[0.16, 1, 0.3, 1]`
- Stagger giữa các phần tử con: `0.04s–0.07s`
- Không dùng `bounce`, `elastic` quá mức

---

## Framer Motion — Patterns tái sử dụng

### 1. Hover underline trượt giữa các item (layoutId)

Dùng cho navigation, tab, list item. Underline trượt mượt khi hover sang item khác.

```tsx
const [hovered, setHovered] = useState<string | null>(null);

{items.map(item => (
  <div
    key={item.id}
    className="relative py-1"
    onMouseEnter={() => setHovered(item.id)}
    onMouseLeave={() => setHovered(null)}
  >
    {item.label}
    {hovered === item.id && (
      <motion.div
        layoutId="nav-underline"   // ← cùng layoutId = trượt giữa các item
        className="absolute bottom-0 left-0 right-0 h-px bg-ink"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
    {/* active state dùng màu coral, hiện khi không hover */}
    {isActive && hovered !== item.id && (
      <div className="absolute bottom-0 left-0 right-0 h-px bg-accent-coral" />
    )}
  </div>
))}
```

> **Lưu ý:** `layoutId` phải unique trong scope của page. Nếu có nhiều group, dùng prefix: `"section-underline"`, `"tab-underline"`.

---

### 2. Dropdown xổ xuống (NavDropdown)

Component tái sử dụng tại [components/nav/NavDropdown.tsx](components/nav/NavDropdown.tsx).

```tsx
import { NavDropdown } from "@/components/nav/NavDropdown";

<NavDropdown
  label="Articles"
  items={[
    { label: "Tất cả bài viết", href: "/" },
    { label: "Lập trình", href: "/category/lap-trinh" },
  ]}
/>
```

**Animation bên trong:**
- Container: `scaleY: 0.92 → 1` + `opacity: 0 → 1` + `y: -6 → 0`, `transformOrigin: "top center"`
- Items: stagger `x: -6 → 0` với delay `0.055s` mỗi item
- Chevron: `rotate: 0 → 180deg`
- Mở khi `onMouseEnter`, đóng sau 120ms delay khi `onMouseLeave` (tránh đóng khi di chuột vào dropdown)

---

### 3. Stagger list (items fade in lần lượt)

Dùng cho danh sách, card grid, menu overlay.

```tsx
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

<motion.ul variants={containerVariants} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.label}
    </motion.li>
  ))}
</motion.ul>
```

---

### 4. Letter wave (stagger từng ký tự)

Dùng cho heading, logo, title đặc biệt.

```tsx
const containerVariants = {
  rest: { transition: { staggerChildren: 0 } },
  hover: { transition: { staggerChildren: 0.04 } },
};

const letterVariants = {
  rest: { y: 0 },
  hover: { y: -3, transition: { type: "spring", stiffness: 700, damping: 20 } },
};

<motion.div initial="rest" animate="rest" whileHover="hover" variants={containerVariants}>
  {"HELLO".split("").map((char, i) => (
    <motion.span key={i} variants={letterVariants} className="inline-block">
      {char}
    </motion.span>
  ))}
</motion.div>
```

> Luôn thêm `className="inline-block"` vào `motion.span` — transform không hoạt động trên `inline`.

---

### 5. Accordion (height: auto)

Dùng cho FAQ, mobile menu, expand/collapse.

```tsx
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

---

### 6. Fade in khi mount (element xuất hiện lần đầu)

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.25, duration: 0.3 }}
>
```

Có thể kết hợp `y`:
```tsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
```

---

### 7. Press effect (button, card có thể click)

```tsx
<motion.button whileTap={{ scale: 0.96 }}>
```

Cho logo hoặc element lớn hơn: `scale: 0.97`.

---

### 8. Cursor nhấp nháy (terminal style)

```tsx
<motion.span
  animate={{ opacity: [1, 0, 1] }}
  transition={{ duration: 1.1, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
  className="text-accent-coral"
>
  _
</motion.span>
```

---

## Border & Spacing

- Border: `border border-line` (1px solid `#1A1A1A`)
- Không dùng `rounded-*` (trừ khi có lý do cụ thể — radius token là `2px`)
- Spacing giữa section: `mb-12` / `mb-16`
- Padding card/panel: `p-4` / `p-6` / `p-8`
- Gap trong list: `gap-3` / `gap-4`

---

## Component structure

```
components/
  nav/
    Logo.tsx          # Letter wave + cursor blink
    NavDropdown.tsx   # Reusable dropdown với animation
    NavMenu.tsx       # Desktop nav + layoutId underline
    UserNav.tsx       # Login/logout section
    MobileMenu.tsx    # Hamburger + overlay
  Header.tsx          # Server Component — đọc session, compose
```

Server/Client split:
- **Server Component**: đọc session, fetch data, render layout tĩnh
- **Client Component** (`"use client"`): animation, hover state, toggle, usePathname

---

## Checklist khi tạo component mới

- [ ] Font: `font-mono` cho label/UI, `font-sans` cho content
- [ ] Màu hover: `hover:text-ink transition-colors` (không đổi background đột ngột)
- [ ] Border: `border-line`, không dùng màu khác
- [ ] Animation: duration ≤ 0.3s, ease `[0.16, 1, 0.3, 1]` hoặc spring
- [ ] Responsive: check mobile trước — `hidden md:block` / `block md:hidden`
- [ ] `"use client"` chỉ khi thật sự cần (animation, state, event handler)
