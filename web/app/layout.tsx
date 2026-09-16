import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Neva-Book — фотокниги онлайн", template: "%s | Neva-Book" },
  description: siteConfig.description,
  openGraph: { title: "Neva-Book", description: siteConfig.description, type: "website", locale: "ru_RU" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <SiteHeader />
        {children}
        <footer className="footer">© {new Date().getFullYear()} Neva-Book · Фотокниги, переплёт и реставрация</footer>
      </body>
    </html>
  );
}
