import { getSession } from "@/lib/session";
import { Logo } from "@/components/nav/Logo";
import { NavMenu } from "@/components/nav/NavMenu";
import { UserNav } from "@/components/nav/UserNav";
import { MobileMenu } from "@/components/nav/MobileMenu";

export async function Header() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-50 bg-paper shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="px-4">
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-16">
          <Logo />
          <NavMenu />
          <UserNav user={user} />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between py-10px">
          <Logo />
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
