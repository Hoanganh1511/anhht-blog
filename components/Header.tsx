import { getSession } from "@/lib/session";
import { Logo } from "@/components/nav/Logo";
import { NavMenu } from "@/components/nav/NavMenu";
import { UserNav } from "@/components/nav/UserNav";
import { MobileMenu } from "@/components/nav/MobileMenu";

export async function Header() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm">
      <div className="px-4">
        {/* Desktop layout: 3-col grid — logo | nav | user */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-16">
          <Logo />
          <NavMenu />
          <UserNav user={user} />
        </div>

        {/* Mobile layout: logo + hamburger */}
        <div className="flex md:hidden items-center justify-between h-16">
          <Logo />
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
