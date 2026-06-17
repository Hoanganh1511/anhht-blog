import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="vi" className={`${ibmPlexMono.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
