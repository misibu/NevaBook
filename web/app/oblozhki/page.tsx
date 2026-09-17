import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Обложки для фотокниг", description: "Фотообложки и тканевые обложки Neva-Book для фотокниг 20×20." };
export default function Page() {
  return <main className="luxPage">
    <section className="luxHero"><span>NEVA-BOOK / ОБЛОЖКИ</span><h1>Обложка — первое<br/><em>впечатление от книги.</em></h1><p>Для первой версии доступны фотообложка и тканевая обложка. Каталог материалов будет связан с конструктором и заказом.</p></section>
    <section className="luxCards">
      <article><div className="materialVisual photoMaterial"><b>ВАШЕ ФОТО</b></div><span>01</span><h2>Фотообложка</h2><p>Изображение на всю поверхность, готовый дизайн или минималистичная композиция.</p><Link href="/create">Выбрать в конструкторе →</Link></article>
      <article><div className="materialVisual fabricMaterial"><b>LINEN</b></div><span>02</span><h2>Тканевая обложка</h2><p>Фактурные материалы, спокойные цвета и персонализация. Каталог тканей подключим к CMS.</p><Link href="/create">Выбрать в конструкторе →</Link></article>
    </section>
  </main>;
}
