import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollRestorer } from "@/components/ScrollRestorer";
import { HeaderController } from "@/components/HeaderController";
import { ModalProvider } from "@/lib/modal-context";
import { WelcomeModalTrigger } from "@/components/WelcomeModal";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    template: "%s | anhht blog",
    default: "anhht blog",
  },
  description: "Blog cá nhân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${ibmPlexMono.variable} ${beVietnamPro.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ModalProvider>
          <ScrollRestorer />
          <HeaderController />
          <WelcomeModalTrigger />
          <Header />
          <div className="flex flex-col flex-1">{children}</div>
          <ScrollToTop />
        </ModalProvider>
      </body>
    </html>
  );
}
