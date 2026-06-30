import { SignInButton } from "@/components/SignInButton";

export const metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper">
      <div className="border border-line bg-surface p-8 w-full max-w-sm">
        <h1 className="font-mono uppercase tracking-[2px] text-sm mb-6">
          Đăng nhập
        </h1>

        <div className="flex flex-col gap-3">
          <SignInButton
            provider="google"
            className="w-full border border-line bg-paper font-mono text-sm py-2 px-4 rounded-sm hover:bg-ink hover:text-paper transition-colors"
          >
            Tiếp tục với Google
          </SignInButton>

          <SignInButton
            provider="github"
            className="w-full border border-line bg-paper font-mono text-sm py-2 px-4 rounded-sm hover:bg-ink hover:text-paper transition-colors"
          >
            Tiếp tục với GitHub
          </SignInButton>
        </div>
      </div>
    </main>
  );
}
