"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import { apiFetch } from "@/lib/api";
import { Camera, UserRound, ShieldCheck } from "lucide-react";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
}

const INPUT_CLASS =
  "w-full font-sans text-base text-ink rounded-sm border b-soft bg-paper px-3 py-2 focus:outline-none focus:border-ink transition-colors";
const LABEL_CLASS = "block font-mono text-sm text-muted mb-2";

export function ProfileTab({ user }: { user: User }) {

  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [imageUrl, setImageUrl] = useState(user.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initial = (user.name ?? user.email)[0].toUpperCase();
  const preview = imageUrl.trim() || null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const metaRes = await apiFetch("/upload", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
    });

    if (!metaRes.ok) {
      setError("Không thể tải ảnh lên. Thử lại.");
      setUploading(false);
      return;
    }

    const { uploadUrl, publicUrl } = await metaRes.json();
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    setUploading(false);
    if (putRes.ok) {
      setImageUrl(publicUrl);
    } else {
      setError("Upload thất bại. Thử lại.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name, image: imageUrl.trim() || null, bio: bio.trim() || null }),
    });

    setSaving(false);
    if (res.ok) {
      await apiFetch("/users/me/refresh-session", { method: "POST" });
      setSaved(true);
      setTimeout(() => window.location.reload(), 800);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className={LABEL_CLASS}>Ảnh đại diện</p>
        <div className="relative w-fit">
          {preview ? (
            <Image
              src={preview}
              alt={name || user.email}
              width={72}
              height={72}
              className="w-18 h-18 rounded-full object-cover border b-soft"
            />
          ) : (
            <div className="w-18 h-18 rounded-full bg-ink text-paper font-mono text-xl font-semibold flex items-center justify-center">
              {initial}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-40"
            title="Đổi ảnh"
          >
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
        {uploading && <p className="font-mono text-xs text-muted mt-2">Đang tải ảnh lên...</p>}
      </div>

      <div>
        <label className={LABEL_CLASS}>Tên hiển thị</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên của bạn"
          maxLength={60}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Giới thiệu ngắn về bạn..."
          maxLength={300}
          rows={3}
          className={INPUT_CLASS + " resize-none"}
        />
        <p className="font-mono text-xs text-muted mt-1 text-right">{bio.length}/300</p>
      </div>

      <div>
        <p className={LABEL_CLASS}>Email</p>
        <div className="w-full font-mono text-base text-muted rounded-sm border b-soft bg-surface px-3 py-2 select-none">
          {user.email}
        </div>
        <p className="font-mono text-xs text-muted mt-1">
          Email liên kết với tài khoản OAuth, không thể thay đổi.
        </p>
      </div>

      {error && <p className="font-mono text-sm text-accent-coral">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="font-mono text-base bg-ink text-paper rounded-sm px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {saved && <span className="font-mono text-xs text-muted">Đã lưu ✓</span>}
      </div>
    </form>
  );
}

export function SecurityTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <div>
        <p className={LABEL_CLASS}>Tài khoản liên kết</p>
        <div className="flex items-center gap-3 border b-soft rounded-sm px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0 text-muted" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <div>
            <p className="font-sans text-sm text-ink">Google</p>
            <p className="font-mono text-xs text-muted">{user.email}</p>
          </div>
          <span className="ml-auto font-mono text-xs text-muted bg-surface border b-soft rounded-sm px-2 py-1">
            Đã kết nối
          </span>
        </div>
      </div>

      <div className="border-t b-soft pt-6">
        <p className={LABEL_CLASS}>Mật khẩu</p>
        <p className="font-sans text-sm text-muted">
          Tài khoản đăng nhập qua OAuth (Google) — không có mật khẩu riêng.
        </p>
      </div>
    </div>
  );
}

const TABS = [
  { id: "profile" as const, label: "Thông tin cơ bản", Icon: UserRound, href: "/account/profile" },
  { id: "security" as const, label: "Bảo mật", Icon: ShieldCheck, href: "/account/security" },
];

/* Mobile: grid of links, shown only on small screens */
export function AccountGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TABS.map(({ label, Icon, href }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-2 rounded-sm py-4 px-2 bg-surface hover:bg-ink hover:text-paper text-muted transition-colors"
        >
          <Icon size={22} />
          <span className="font-mono text-xs text-center leading-tight">{label}</span>
        </Link>
      ))}
    </div>
  );
}

/* Desktop: sidebar + inline content */
export function AccountDesktop({ user }: { user: User }) {
  const [tab, setTab] = useState<"profile" | "security">("profile");

  return (
    <div className="flex gap-10">
      <nav className="w-36 shrink-0 space-y-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`w-full text-left font-mono text-sm px-3 py-2 rounded-sm transition-colors ${
              tab === id ? "bg-ink text-paper" : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="flex-1 min-w-0">
        {tab === "profile" && <ProfileTab user={user} />}
        {tab === "security" && <SecurityTab user={user} />}
      </div>
    </div>
  );
}
