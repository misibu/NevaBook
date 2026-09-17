import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site";
import "./globals.css";
import "./premium-v2.css";
import "./editor-viewport-fix.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Нева-Бук — фотокниги, печать и реставрация", template: "%s | Нева-Бук" },
  description: siteConfig.description,
  openGraph: { title: "Нева-Бук", description: siteConfig.description, type: "website", locale: "ru_RU" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <SiteHeader />
        {children}
        <footer className="footer premiumFooter">
          <strong>НЕВА-БУК</strong>
          <span>Фотокниги · Печать на холсте · Переплёт · Реставрация фотографий</span>
          <small>© {new Date().getFullYear()} Neva-Book</small>
        </footer>
      </body>
    </html>
  );
}
