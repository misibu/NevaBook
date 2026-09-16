import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="Neva-Book — главная">
        <span className="brandMark">NB</span>
        <span>NEVA-BOOK</span>
      </Link>
      <nav className="mainNav" aria-label="Основное меню">
        <Link href="/fotoknigi">Фотокниги</Link>
        <Link href="/oblozhki">Обложки</Link>
        <Link href="/ceny">Цены</Link>
        <Link href="/blog">Блог</Link>
      </nav>
      <Link className="headerCta" href="/create">Создать книгу</Link>
    </header>
  );
}
