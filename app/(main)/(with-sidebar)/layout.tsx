import { Sidebar } from "@/components/Sidebar";
import { SocialLinks } from "@/components/SocialLinks";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <footer className="md:hidden border-t border-line/20">
        <SocialLinks />
      </footer>
    </div>
  );
}
