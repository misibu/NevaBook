import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Фотокниги",
  description: "Создайте фотокнигу Neva-Book онлайн: формат 20×20, фотообложка или тканевая обложка.",
};

export default function PhotoBooksPage() {
  return (
    <main className="pageShell">
      <p className="eyebrow">КАТАЛОГ</p>
      <h1>Фотокниги</h1>
      <p className="lead">Начинаем с самого универсального формата — квадратной книги 20×20 см.</p>
      <div className="catalogGrid">
        <article className="catalogCard"><div className="catalogVisual">20×20</div><h2>Фотокнига 20×20</h2><p>Фотообложка или ткань. Автоматическая и ручная раскладка.</p><Link href="/create">Создать книгу →</Link></article>
        <article className="catalogCard muted"><div className="catalogVisual">30×30</div><h2>Фотокнига 30×30</h2><p>Формат заложен в каталог и будет подключён после 20×20.</p><span>Скоро</span></article>
      </div>
    </main>
  );
}
