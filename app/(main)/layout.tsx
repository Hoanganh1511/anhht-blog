import { Sidebar } from "@/components/Sidebar";
import { SocialLinks } from "@/components/SocialLinks";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollRestorer } from "@/components/ScrollRestorer";
import { HeaderController } from "@/components/HeaderController";
import { WelcomeModalTrigger } from "@/components/WelcomeModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <ScrollRestorer />
      <HeaderController />
      <WelcomeModalTrigger />
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
