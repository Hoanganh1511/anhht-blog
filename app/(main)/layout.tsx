import { Sidebar } from "@/components/Sidebar";
import { SocialLinks } from "@/components/SocialLinks";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollRestorer } from "@/components/ScrollRestorer";
import { HeaderController } from "@/components/HeaderController";
import { WelcomeModalTrigger } from "@/components/WelcomeModal";
import { getSession } from "@/lib/session";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex flex-col flex-1">
      <ScrollRestorer />
      <HeaderController />
      <WelcomeModalTrigger isLoggedIn={!!session} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <footer className="md:hidden border-t border-line/20">
        <SocialLinks />
      </footer>
      <ScrollToTop />
    </div>
  );
}
