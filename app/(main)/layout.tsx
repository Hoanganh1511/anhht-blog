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
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      <ScrollToTop />
    </div>
  );
}
