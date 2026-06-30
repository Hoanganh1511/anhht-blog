import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ModalProvider } from "@/lib/modal-context";

const montserrat = Montserrat({
  variable: "--font-montserrat",
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
    <html lang="vi" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col">
        <ModalProvider>
          <Header />
          <div className="flex flex-col flex-1">{children}</div>
        </ModalProvider>
      </body>
    </html>
  );
}
