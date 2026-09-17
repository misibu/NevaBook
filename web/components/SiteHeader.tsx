import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="siteHeader premiumHeader">
      <Link className="brandLogo" href="/" aria-label="Нева-Бук — главная">
        <Image src="/brand/neva-book-logo.svg" alt="Нева-Бук" width={330} height={110} priority />
      </Link>
      <nav className="mainNav premiumNav" aria-label="Основное меню">
        <Link href="/fotoknigi">Фотокниги</Link>
        <Link href="/holst">Холст</Link>
        <Link href="/pereplet">Переплёт</Link>
        <Link href="/restavraciya">Реставрация</Link>
        <Link href="/oblozhki">Обложки</Link>
        <Link href="/ceny">Цены</Link>
      </nav>
      <Link className="headerCta premiumCta" href="/create">Создать книгу</Link>
    </header>
  );
}
