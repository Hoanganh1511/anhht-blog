import { signIn } from "@/auth";

export const metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
      <div className="border border-[var(--line)] bg-[var(--surface)] p-8 w-full max-w-sm">
        <h1 className="font-mono uppercase tracking-[2px] text-sm mb-6">
          Đăng nhập
        </h1>

        <div className="flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full border border-[var(--line)] bg-[var(--paper)] font-mono text-sm py-2 px-4 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            >
              Tiếp tục với Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full border border-[var(--line)] bg-[var(--paper)] font-mono text-sm py-2 px-4 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            >
              Tiếp tục với GitHub
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
