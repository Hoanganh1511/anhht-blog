"use client";

export function SignOutButton({ className }: { className?: string }) {
  async function handleSignOut() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  }

  return (
    <button onClick={handleSignOut} className={className}>
      Đăng xuất
    </button>
  );
}
